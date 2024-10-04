import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  Button,
  View,
} from 'react-native';
import axios from 'axios';
import { BarChart } from 'react-native-chart-kit';

export default function M1() {
  const [sensorData, setSensorData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [currentMode, setCurrentMode] = useState('');

  const apiBaseUrl = 'http://192.168.100.8:3002/api';

  useEffect(() => {
    // Fetch default data when component mounts
    setCurrentMode('6hr');
    fetchSpecialisedHistoricalData('data/last6hours', 3);
  }, []);

  const aggregateSpecialisedData = (data, numIntervals) => {
    const totalDataPoints = data.length;
    const intervalSize = Math.floor(totalDataPoints / numIntervals);

    const aggregatedData = [];
    const aggregatedLabels = [];

    for (let i = 0; i < numIntervals; i++) {
      const startIdx = i * intervalSize;
      const endIdx = i === numIntervals - 1 ? totalDataPoints : (i + 1) * intervalSize;

      const intervalData = data.slice(startIdx, endIdx);

      const sum = intervalData.reduce((acc, item) => acc + item.windSpeedmsData, 0);
      const average = sum / intervalData.length;
      aggregatedData.push(average);

      // Use the timestamp of the first data point in the interval for labeling
      const labelTimestamp = new Date(intervalData[0].timestamp);
      const label = `${labelTimestamp.getHours()}:${labelTimestamp.getMinutes()}`;
      aggregatedLabels.push(label);
    }

    return { aggregatedData, aggregatedLabels };
  };

  const fetchSpecialisedHistoricalData = async (endpoint, numIntervals) => {
    try {
      console.log('Fetching data from API...');
      const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
      const data = response.data;

      console.log('Data fetched:', data);

      if (Array.isArray(data) && data.length > 0) {
        const { aggregatedData, aggregatedLabels } = aggregateSpecialisedData(
          data,
          numIntervals
        );

        setSensorData(aggregatedData);
        setTimeLabels(aggregatedLabels);
      } else {
        console.warn('No historical data received from the backend.');
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const handleModeChange = (mode, apiEndpoint, numIntervals) => {
    console.log(`Button pressed for mode: ${mode}`);
    setCurrentMode(mode);
    fetchSpecialisedHistoricalData(apiEndpoint, numIntervals);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          M1 Sensor Data {currentMode ? `(${currentMode} Data)` : ''}
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Last 6 Hours"
            onPress={() => handleModeChange('6hr', 'data/last6hours', 3)}
          />
          <Button
            title="Last 12 Hours"
            onPress={() => handleModeChange('12hr', 'data/last12hours', 3)}
          />
          <Button
            title="Last 24 Hours"
            onPress={() => handleModeChange('24hr', 'data/lastday', 3)}
          />
        </View>

        {sensorData.length > 0 && timeLabels.length > 0 ? (
          <BarChart
            data={{
              labels: timeLabels,
              datasets: [
                {
                  data: sensorData,
                },
              ],
            }}
            width={Dimensions.get('window').width - 30}
            height={220}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <Text>Loading data...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});
