import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Gamepad2, Upload } from 'lucide-react-native';

interface LibraryGame {
  id: string;
  game_id: string;
  ownership_status: string;
  notes: string;
  games: {
    id: string;
    title: string;
    description: string;
    min_players: number;
    max_players: number;
    duration_minutes: number;
    complexity: number;
    image_url: string | null;
  };
}

export default function LibraryScreen() {
  const [library, setLibrary] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const fetchLibrary = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_libraries')
        .select(
          `
          id,
          game_id,
          ownership_status,
          notes,
          games (
            id,
            title,
            description,
            min_players,
            max_players,
            duration_minutes,
            complexity,
            image_url
          )
        `
        )
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setLibrary((data || []) as any);
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLibrary();
  };

  const renderGame = ({ item }: { item: LibraryGame }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => router.push(`/game/${item.game_id}`)}
    >
      <View style={styles.gameIcon}>
        <Gamepad2 size={32} color="#007AFF" />
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{item.games.title}</Text>
        <Text style={styles.gameMeta}>
          {item.games.min_players}-{item.games.max_players} players •{' '}
          {item.games.duration_minutes} min
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.ownership_status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => router.push('/game/import')}
          >
            <Upload size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/game/add')}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {library.length === 0 ? (
        <View style={styles.emptyState}>
          <Gamepad2 size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No games yet</Text>
          <Text style={styles.emptyText}>
            Start building your collection by adding games
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/game/add')}
          >
            <Text style={styles.emptyButtonText}>Add Your First Game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={library}
          renderItem={renderGame}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  importButton: {
    backgroundColor: '#F2F2F7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gameIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  gameMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
