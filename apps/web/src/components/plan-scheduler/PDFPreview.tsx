'use client';

import React, { useMemo } from 'react';
import { PDFViewer, Document, Page, Text, View } from '@react-pdf/renderer';
import { useGymConfig } from '@/lib/gym-config-store';

export default function PDFPreview({ template }: { template: any }) {
  const { config } = useGymConfig();
  const styles = useMemo(() => {
    return {
      page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
      header: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, borderBottom: '2px solid #111', paddingBottom: 15, marginBottom: 20 },
      gymName: { fontSize: 24, fontWeight: 'bold' as const, color: '#111' },
      planTitle: { fontSize: 18, color: '#333', marginTop: 8 },
      memberGreeting: { fontSize: 14, color: '#555', marginBottom: 20 },
      sectionTitle: { fontSize: 16, fontWeight: 'bold' as const, backgroundColor: '#f4f4f5', padding: 8, marginBottom: 10, color: '#111' },
      dayBlock: { marginBottom: 15 },
      dayName: { fontSize: 14, fontWeight: 'bold' as const, color: '#111', marginBottom: 5, borderBottom: '1px solid #eee', paddingBottom: 3 },
      exerciseRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, paddingVertical: 4, borderBottom: '1px solid #fafafa' },
      exName: { fontSize: 12, color: '#333', flex: 2 },
      exDetail: { fontSize: 12, color: '#666', flex: 1, textAlign: 'right' as const },
      dietBlock: { marginTop: 10, marginBottom: 20 },
      dietRow: { flexDirection: 'row' as const, marginBottom: 4 },
      dietLabel: { fontSize: 12, fontWeight: 'bold' as const, width: 80, color: '#333' },
      dietValue: { fontSize: 12, color: '#555', flex: 1 },
      footer: { position: 'absolute' as const, bottom: 30, left: 40, right: 40, borderTop: '1px solid #eee', paddingTop: 10, flexDirection: 'row' as const, justifyContent: 'space-between' as const },
      footerText: { fontSize: 10, color: '#888' },
      notesBox: { padding: 10, backgroundColor: '#f8fafc', borderLeft: '3px solid #3b82f6', marginTop: 10 },
      notesText: { fontSize: 11, color: '#475569', fontStyle: 'italic' as const }
    };
  }, []);

  const MyDoc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
               <Text style={{ fontSize: 16, backgroundColor: config.primaryColor, color: '#fff', padding: '4 8', marginRight: 8, borderRadius: 4, fontWeight: 'bold' }}>{config.logoInitials}</Text>
               <Text style={styles.gymName}>{config.gymName.toUpperCase()}</Text>
            </View>
            <Text style={styles.planTitle}>{template?.name}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 10, color: '#888', textAlign: 'right' }}>{new Date().toLocaleDateString('en-IN')}</Text>
            <Text style={{ fontSize: 10, color: '#888', textAlign: 'right', marginTop: 4 }}>Goal: {template?.goal}</Text>
          </View>
        </View>

        <Text style={styles.memberGreeting}>Hi [Member Name], here is your personalized plan.</Text>

        {template?.days && template.days.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>WORKOUT SCHEDULE</Text>
            {template.days.map((day: any, i: number) => (
              <View key={i} style={styles.dayBlock}>
                <Text style={styles.dayName}>Day {i+1}: {day.name}</Text>
                {day.exercises.length > 0 ? (
                  day.exercises.map((ex: any, j: number) => (
                    <View key={j} style={styles.exerciseRow}>
                      <Text style={styles.exName}>• {ex.exercise.name}</Text>
                      <Text style={styles.exDetail}>{ex.sets} sets x {ex.reps}</Text>
                      <Text style={styles.exDetail}>Rest: {ex.rest}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ fontSize: 12, color: '#888', fontStyle: 'italic' as const, marginTop: 4 }}>Rest / Active Recovery</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {template?.diet && template.diet.morning && (
          <View style={styles.dietBlock}>
            <Text style={styles.sectionTitle}>NUTRITION GUIDELINES</Text>
            <View style={styles.dietRow}><Text style={styles.dietLabel}>Morning:</Text><Text style={styles.dietValue}>{template.diet.morning}</Text></View>
            <View style={styles.dietRow}><Text style={styles.dietLabel}>Pre Workout:</Text><Text style={styles.dietValue}>{template.diet.preWorkout}</Text></View>
            <View style={styles.dietRow}><Text style={styles.dietLabel}>Post Workout:</Text><Text style={styles.dietValue}>{template.diet.postWorkout}</Text></View>
            <View style={styles.dietRow}><Text style={styles.dietLabel}>Night:</Text><Text style={styles.dietValue}>{template.diet.night}</Text></View>
          </View>
        )}

        {template?.coachNotes && (
          <View style={styles.notesBox}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' as const, marginBottom: 4, color: '#333' }}>Coach's Note:</Text>
            <Text style={styles.notesText}>{template.coachNotes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by GymOS</Text>
          <Text style={styles.footerText}>Assigned by {config.coachName} • Train Hard! 💪</Text>
        </View>
      </Page>
    </Document>
  );

  return (
    <PDFViewer width="100%" height="100%" className="rounded-lg shadow-sm">
      <MyDoc />
    </PDFViewer>
  );
}
