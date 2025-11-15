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
import { ArrowLeft, Edit3, MessageCircle } from 'lucide-react-native';

interface GameRules {
  id: string;
  game_id: string;
  content: {
    sections?: Array<{
      title: string;
      content: string;
    }>;
  };
  version: string;
  language: string;
}

interface Game {
  id: string;
  title: string;
  creator_id: string;
}

export default function GameRulesScreen() {
  const { id } = useLocalSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [rules, setRules] = useState<GameRules | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchGameAndRules();
  }, [id]);

  const fetchGameAndRules = async () => {
    try {
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id, title, creator_id')
        .eq('id', id)
        .maybeSingle();

      if (gameError) throw gameError;
      setGame(gameData);

      const { data: rulesData, error: rulesError } = await supabase
        .from('game_rules')
        .select('*')
        .eq('game_id', id)
        .maybeSingle();

      if (rulesError) throw rulesError;
      setRules(rulesData);
    } catch (error) {
      console.error('Error fetching rules:', error);
      Alert.alert('Error', 'Failed to load game rules');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = game && user && game.creator_id === user.id;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const sections = rules?.content?.sections || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rules</Text>
        {canEdit && (
          <TouchableOpacity
            onPress={() => router.push(`/game/${id}/rules/edit`)}
            style={styles.editButton}
          >
            <Edit3 size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
        {!canEdit && <View style={styles.placeholder} />}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.gameTitle}>{game?.title}</Text>
          <Text style={styles.version}>Version {rules?.version || '1.0'}</Text>
        </View>

        {sections.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No rules yet</Text>
            <Text style={styles.emptyText}>
              {canEdit
                ? 'Add rules to help players understand the game'
                : 'The game creator hasn\'t added rules yet'}
            </Text>
            {canEdit && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push(`/game/${id}/rules/edit`)}
              >
                <Text style={styles.addButtonText}>Add Rules</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.rulesContainer}>
            {sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionContent}>{section.content}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.aiHelpSection}>
          <Text style={styles.aiHelpTitle}>Need Help?</Text>
          <Text style={styles.aiHelpText}>
            Ask our AI assistant to explain any rule or answer questions about
            the game.
          </Text>
          <TouchableOpacity style={styles.aiButton}>
            <MessageCircle size={20} color="#ffffff" />
            <Text style={styles.aiButtonText}>Ask AI Assistant</Text>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  editButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rulesContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
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
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  aiHelpSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    margin: 16,
  },
  aiHelpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  aiHelpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  aiButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  aiButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
