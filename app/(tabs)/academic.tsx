import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';
import { t } from '../../src/utils/i18n';

interface Course {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  file_count: number;
}

export default function AcademicTab() {
  const { user } = useAuth();
  const router = useRouter();
  const lang = user?.language || 'en';

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [editModal, setEditModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameAr, setEditNameAr] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDescAr, setEditDescAr] = useState('');
  const [saving, setSaving] = useState(false);

  // -----------------------------
  // FETCH COURSES
  // -----------------------------
  const fetchCourses = useCallback(async () => {
    try {
      const data = await apiCall('/api/courses/');
      setCourses(data.courses);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, []);

  // -----------------------------
  // SEARCH
  // -----------------------------
  async function handleSearch(q: string) {
    setSearch(q);
    if (q.length < 2) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const data = await apiCall(`/api/search?q=${encodeURIComponent(q)}`);
      setSearchResults(data);
    } catch {}
    finally {
      setSearching(false);
    }
  }

  // -----------------------------
  // OPEN EDIT MODAL
  // -----------------------------
  function openEdit(c: Course) {
    setEditCourse(c);
    setEditName(c.name);
    setEditNameAr(c.name_ar);
    setEditDesc(c.description);
    setEditDescAr(c.description_ar);
    setEditModal(true);
  }

  // -----------------------------
  // SAVE EDIT
  // -----------------------------
  async function handleSaveEdit() {
    if (!editCourse || !editName.trim()) return;

    setSaving(true);
    try {
      const data = await apiCall(`/api/courses/${editCourse.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName.trim(),
          name_ar: editNameAr.trim(),
          description: editDesc.trim(),
          description_ar: editDescAr.trim()
        })
      });

      setCourses(prev => prev.map(c => c.id === editCourse.id ? data.course : c));
      setEditModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // DELETE COURSE
  // -----------------------------
  async function handleDelete(courseId: string, courseName: string) {
    Alert.alert('Delete Course', `Delete "${courseName}" and all its files?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiCall(`/api/courses/${courseId}`, { method: 'DELETE' });
            setCourses(prev => prev.filter(c => c.id !== courseId));
          } catch {}
        }
      }
    ]);
  }

  const courseIcons: Record<string, string> = {
    'Chemical Calculus': 'calculator',
    'Thermodynamics': 'flame',
    'Reaction Engineering': 'flask',
    'Mass Transfer': 'swap-horizontal',
    'Process Control': 'settings'
  };

  function renderCourse({ item }: { item: Course }) {
    const iconName = courseIcons[item.name] || 'book';

    return (
      <TouchableOpacity
        testID={`course-card-${item.id}`}
        style={styles.courseCard}
        onPress={() => router.push(`/course/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.courseIcon}>
          <Ionicons name={iconName as any} size={28} color={Colors.accent} />
        </View>

        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>
            {lang === 'ar' ? item.name_ar : item.name}
          </Text>

          <Text style={styles.courseDesc} numberOfLines={2}>
            {lang === 'ar' ? item.description_ar : item.description}
          </Text>

          <View style={styles.courseStats}>
            <Ionicons name="document-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.statText}>
              {item.file_count} {t('files', lang)}
            </Text>
          </View>
        </View>

        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              testID={`edit-course-${item.id}`}
              style={styles.iconBtn}
              onPress={(e) => { e.stopPropagation?.(); openEdit(item); }}
            >
              <Ionicons name="pencil" size={16} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              testID={`delete-course-${item.id}`}
              style={styles.iconBtn}
              onPress={(e) => { e.stopPropagation?.(); handleDelete(item.id, item.name); }}
            >
              <Ionicons name="trash" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}

        {!isAdmin && (
          <Ionicons name="chevron-forward" size={20} color={Colors.border} />
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="academic-tab">
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
        <TextInput
          testID="search-input"
          style={styles.searchInput}
          placeholder={t('searchPlaceholder', lang)}
          value={search}
          onChangeText={handleSearch}
          placeholderTextColor={Colors.textSecondary}
        />
        {searching && <ActivityIndicator size="small" color={Colors.accent} />}
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); setSearchResults(null); }}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* باقي الكود كما هو */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 16, marginBottom: 8, paddingHorizontal: 16, borderRadius: 12, height: 48, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
});
