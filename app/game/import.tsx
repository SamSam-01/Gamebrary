import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { importFromJSON, parseCSV, importGame } from '@/utils/gameImporter';
import { ArrowLeft, FileJson, FileSpreadsheet, Upload } from 'lucide-react-native';

export default function ImportGameScreen() {
  const [importType, setImportType] = useState<'json' | 'csv'>('json');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleImport = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content to import');
      return;
    }

    setLoading(true);
    try {
      if (importType === 'json') {
        const result = await importFromJSON(content, user!.id, isPublic);
        if (result.success) {
          Alert.alert('Success', 'Game imported successfully!');
          router.back();
        } else {
          Alert.alert('Error', result.error || 'Failed to import game');
        }
      } else {
        const games = parseCSV(content);
        if (games.length === 0) {
          Alert.alert('Error', 'No valid games found in CSV');
          return;
        }

        let successCount = 0;
        for (const game of games) {
          const result = await importGame(game, user!.id, isPublic);
          if (result.success) successCount++;
        }

        Alert.alert(
          'Import Complete',
          `Successfully imported ${successCount} of ${games.length} games`
        );
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to import');
    } finally {
      setLoading(false);
    }
  };

  const jsonExample = `{
  "title": "Skull King",
  "description": "A trick-taking card game",
  "minPlayers": 2,
  "maxPlayers": 6,
  "durationMinutes": 30,
  "ageMin": 8,
  "complexity": 2,
  "rules": {
    "sections": [
      {
        "title": "Objective",
        "content": "Predict the exact number of tricks you will win"
      }
    ]
  },
  "scoringSystem": {
    "name": "Standard",
    "config": {
      "type": "points",
      "formula": "bid * 20 + tricks * 10"
    },
    "isAutomated": true
  }
}`;

  const csvExample = `title,description,minPlayers,maxPlayers,duration,age,complexity
Skull King,A trick-taking card game,2,6,30,8,2
Catan,Resource management and trading,3,4,90,10,3`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import Games</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Import Format</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.formatButton,
                importType === 'json' && styles.formatButtonActive,
              ]}
              onPress={() => setImportType('json')}
            >
              <FileJson
                size={20}
                color={importType === 'json' ? '#ffffff' : '#007AFF'}
              />
              <Text
                style={[
                  styles.formatButtonText,
                  importType === 'json' && styles.formatButtonTextActive,
                ]}
              >
                JSON
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formatButton,
                importType === 'csv' && styles.formatButtonActive,
              ]}
              onPress={() => setImportType('csv')}
            >
              <FileSpreadsheet
                size={20}
                color={importType === 'csv' ? '#ffffff' : '#007AFF'}
              />
              <Text
                style={[
                  styles.formatButtonText,
                  importType === 'csv' && styles.formatButtonTextActive,
                ]}
              >
                CSV
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Example Format</Text>
          <ScrollView
            style={styles.exampleBox}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <Text style={styles.exampleText}>
              {importType === 'json' ? jsonExample : csvExample}
            </Text>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Paste {importType.toUpperCase()} Content
          </Text>
          <TextInput
            style={styles.textArea}
            value={content}
            onChangeText={setContent}
            placeholder={`Paste your ${importType.toUpperCase()} here...`}
            multiline
            numberOfLines={10}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Share with Community</Text>
              <Text style={styles.hint}>
                Make imported games visible to everyone
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.importButton, loading && styles.importButtonDisabled]}
          onPress={handleImport}
          disabled={loading}
        >
          <Upload size={20} color="#ffffff" />
          <Text style={styles.importButtonText}>
            {loading ? 'Importing...' : 'Import Games'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Import Tips</Text>
          <Text style={styles.infoText}>
            • JSON format allows importing complete game data including rules
            and scoring systems
          </Text>
          <Text style={styles.infoText}>
            • CSV format is great for bulk importing basic game information
          </Text>
          <Text style={styles.infoText}>
            • All imported games are automatically added to your library
          </Text>
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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  formatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
  },
  formatButtonActive: {
    backgroundColor: '#007AFF',
  },
  formatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  formatButtonTextActive: {
    color: '#ffffff',
  },
  exampleBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    maxHeight: 200,
  },
  exampleText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#00ff00',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1a1a1a',
    height: 200,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  importButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});
