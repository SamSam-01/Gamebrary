import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Users,
  Clock,
  Star,
  BookOpen,
  Play,
  Share2,
  Heart,
} from 'lucide-react-native';

interface Game {
  id: string;
  title: string;
  description: string;
  min_players: number;
  max_players: number;
  duration_minutes: number;
  age_min: number;
  complexity: number;
  image_url: string | null;
  creator_id: string;
  is_public: boolean;
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [inLibrary, setInLibrary] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchGame();
    checkLibrary();
  }, [id]);

  const fetchGame = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setGame(data);
    } catch (error) {
      console.error('Error fetching game:', error);
      Alert.alert('Error', 'Failed to load game details');
    } finally {
      setLoading(false);
    }
  };

  const checkLibrary = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_libraries')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_id', id)
        .maybeSingle();

      if (error) throw error;
      setInLibrary(!!data);
    } catch (error) {
      console.error('Error checking library:', error);
    }
  };

  const addToLibrary = async () => {
    if (!user || !game) return;

    try {
      const { error } = await supabase.from('user_libraries').insert({
        user_id: user.id,
        game_id: game.id,
        ownership_status: 'owned',
      });

      if (error) throw error;
      setInLibrary(true);
      Alert.alert('Success', 'Game added to your library!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add game to library');
    }
  };

  const removeFromLibrary = async () => {
    if (!user || !game) return;

    Alert.alert(
      'Remove Game',
      'Are you sure you want to remove this game from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_libraries')
                .delete()
                .eq('user_id', user.id)
                .eq('game_id', game.id);

              if (error) throw error;
              setInLibrary(false);
              Alert.alert('Success', 'Game removed from your library');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove game');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Game not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.gameIcon}>
            <Text style={styles.gameIconText}>{game.title.charAt(0)}</Text>
          </View>
          <Text style={styles.title}>{game.title}</Text>
          <Text style={styles.description}>{game.description}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={24} color="#007AFF" />
            <Text style={styles.statValue}>
              {game.min_players}-{game.max_players}
            </Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>

          <View style={styles.statCard}>
            <Clock size={24} color="#007AFF" />
            <Text style={styles.statValue}>{game.duration_minutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>

          <View style={styles.statCard}>
            <Star size={24} color="#007AFF" />
            <Text style={styles.statValue}>{game.complexity}/5</Text>
            <Text style={styles.statLabel}>Complexity</Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          {inLibrary ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push(`/session/create?gameId=${game.id}`)}
              >
                <Play size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Start Session</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push(`/game/${game.id}/rules`)}
              >
                <BookOpen size={20} color="#007AFF" />
                <Text style={styles.secondaryButtonText}>View Rules</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dangerButton}
                onPress={removeFromLibrary}
              >
                <Text style={styles.dangerButtonText}>Remove from Library</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={addToLibrary}
            >
              <Heart size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Add to Library</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  },
  backButton: {
    padding: 4,
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  gameIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameIconText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});
