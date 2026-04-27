import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';
import { t } from '../../src/utils/i18n';

interface Course { id: string; name: string; name_ar: string; description: string; description_ar: string; file_count: number; }

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

  async function handleSearch(q: string) {
    setSearch(q);
    if (q.length < 2) { setSearchResults(null); return; }
    setSearching(true);
    try { 
      const data = await apiCall(`/api/search?q=${encodeURIComponent(q)}`); 
      setSearchResults(data); 
    } catch {} 
    finally { 
      setSearching(false); 
    }
  }

  function openEdit(c: Course) {
    setEditCourse(c); 
    setEditName(c.name); 
    setEditNameAr(c.name_ar); 
    setEditDesc(c.description); 
    setEditDescAr(c.description_ar); 
    setEditModal(true);
  }

  async function handleSaveEdit()
