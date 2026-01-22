/**
 * Agriculture & Crop Recognition Module
 * Identifies crops, detects diseases, and provides farming solutions
 */

class CropRecognizer {
      constructor() {
            this.model = null;
            this.isLoaded = false;

            // Common Indian crops with Hindi and English names
            this.cropDatabase = {
                  wheat: {
                        hindi: 'गेहूं',
                        english: 'Wheat',
                        emoji: '🌾',
                        season: 'Rabi (Winter)',
                        solutions: [
                              'Best sowing time: October-November',
                              'Soil: Well-drained loamy soil',
                              'Water: Irrigate at critical stages (Crown root, tillering, flowering)',
                              'Fertilizer: 120 kg N, 60 kg P, 40 kg K per hectare',
                              'Harvest: March-April when moisture content is 20-25%'
                        ],
                        diseases: {
                              rust: 'Apply fungicides like Propiconazole',
                              blight: 'Use disease-resistant varieties',
                              aphids: 'Spray neem oil or insecticide'
                        }
                  },
                  rice: {
                        hindi: 'धान/चावल',
                        english: 'Rice',
                        emoji: '🌾',
                        season: 'Kharif (Monsoon)',
                        solutions: [
                              'Best sowing time: June-July',
                              'Soil: Clayey loam with good water retention',
                              'Water: Keep field flooded 2-5 cm throughout growing period',
                              'Fertilizer: 120 kg N, 60 kg P, 40 kg K per hectare',
                              'Harvest: October-November when grains turn golden'
                        ],
                        diseases: {
                              blast: 'Use Tricyclazole fungicide',
                              blight: 'Spray Copper oxychloride',
                              stemBorer: 'Release Trichogramma wasps or use pesticides'
                        }
                  },
                  corn: {
                        hindi: 'मक्का',
                        english: 'Maize/Corn',
                        emoji: '🌽',
                        season: 'Kharif & Rabi',
                        solutions: [
                              'Best sowing: February-March (Spring), June-July (Kharif)',
                              'Soil: Well-drained fertile soil',
                              'Water: Regular irrigation at knee-high and tasseling stage',
                              'Fertilizer: 150 kg N, 60 kg P, 40 kg K per hectare',
                              'Harvest: When kernels are hard and moisture is 20-25%'
                        ],
                        diseases: {
                              blight: 'Use resistant varieties, apply fungicides',
                              cob_rot: 'Ensure good drainage and air circulation',
                              armyworm: 'Use biological control or insecticides'
                        }
                  },
                  sugarcane: {
                        hindi: 'गन्ना',
                        english: 'Sugarcane',
                        emoji: '🎋',
                        season: 'Year-round',
                        solutions: [
                              'Best planting: February-March (Spring)',
                              'Soil: Deep, well-drained loamy soil',
                              'Water: Regular irrigation every 7-10 days',
                              'Fertilizer: 150-200 kg N, 60-80 kg P, 60-80 kg K per hectare',
                              'Harvest: 10-12 months after planting'
                        ],
                        diseases: {
                              red_rot: 'Use disease-free sets, resistant varieties',
                              smut: 'Remove infected plants immediately',
                              borers: 'Release Trichogramma parasites'
                        }
                  },
                  cotton: {
                        hindi: 'कपास',
                        english: 'Cotton',
                        emoji: '☁️',
                        season: 'Kharif',
                        solutions: [
                              'Best sowing: May-June',
                              'Soil: Black cotton soil or well-drained loam',
                              'Water: Irrigate at flowering and boll formation',
                              'Fertilizer: 100 kg N, 50 kg P, 50 kg K per hectare',
                              'Harvest: October-December when bolls open'
                        ],
                        diseases: {
                              wilt: 'Crop rotation and resistant varieties',
                              boll_rot: 'Improve drainage, apply fungicides',
                              bollworm: 'Use Bt cotton or spray insecticides'
                        }
                  },
                  potato: {
                        hindi: 'आलू',
                        english: 'Potato',
                        emoji: '🥔',
                        season: 'Rabi',
                        solutions: [
                              'Best planting: October-November',
                              'Soil: Well-drained sandy loam',
                              'Water: Light frequent irrigation',
                              'Fertilizer: 150 kg N, 80 kg P, 100 kg K per hectare',
                              'Harvest: 90-120 days after planting'
                        ],
                        diseases: {
                              late_blight: 'Spray Mancozeb or metalaxyl',
                              early_blight: 'Crop rotation, use fungicides',
                              aphids: 'Spray neem oil or imidacloprid'
                        }
                  },
                  tomato: {
                        hindi: 'टमाटर',
                        english: 'Tomato',
                        emoji: '🍅',
                        season: 'Year-round (protected)',
                        solutions: [
                              'Best planting: July-August (Kharif), November-December (Rabi)',
                              'Soil: Well-drained loamy soil, pH 6-7',
                              'Water: Drip irrigation preferred, avoid water logging',
                              'Fertilizer: 150 kg N, 100 kg P, 75 kg K per hectare',
                              'Harvest: 60-80 days after transplanting'
                        ],
                        diseases: {
                              blight: 'Apply Chlorothalonil or Mancozeb',
                              wilt: 'Use resistant varieties, soil fumigation',
                              fruit_borer: 'Use pheromone traps and spray pesticides'
                        }
                  },
                  onion: {
                        hindi: 'प्याज',
                        english: 'Onion',
                        emoji: '🧅',
                        season: 'Rabi & Kharif',
                        solutions: [
                              'Best sowing: October-November (Rabi), June-July (Kharif)',
                              'Soil: Well-drained loamy soil',
                              'Water: Light irrigation at bulb formation',
                              'Fertilizer: 100 kg N, 50 kg P, 50 kg K per hectare',
                              'Harvest: When tops fall over and dry'
                        ],
                        diseases: {
                              purple_blotch: 'Spray Mancozeb at disease appearance',
                              basal_rot: 'Treat seeds with fungicide',
                              thrips: 'Use yellow sticky traps and spray insecticides'
                        }
                  },
                  banana: {
                        hindi: 'केला',
                        english: 'Banana',
                        emoji: '🍌',
                        season: 'Year-round',
                        solutions: [
                              'Best planting: February-March, October-November',
                              'Soil: Deep, well-drained loamy soil',
                              'Water: Heavy irrigation requirement - 2000-2500 mm',
                              'Fertilizer: 200 kg N, 60 kg P, 300 kg K per hectare',
                              'Harvest: 11-15 months after planting'
                        ],
                        diseases: {
                              panama_wilt: 'Use tissue culture plants, resistant varieties',
                              leaf_spot: 'Remove affected leaves, spray fungicides',
                              bunchy_top: 'Remove infected plants, control aphids'
                        }
                  },
                  mango: {
                        hindi: 'आम',
                        english: 'Mango',
                        emoji: '🥭',
                        season: 'Fruiting: March-June',
                        solutions: [
                              'Best planting: July-August',
                              'Soil: Deep, well-drained, slightly acidic',
                              'Water: Irrigate during flowering and fruit development',
                              'Fertilizer: 1 kg N, 0.5 kg P, 1 kg K per tree per year',
                              'Harvest: When fruit turns yellow-green'
                        ],
                        diseases: {
                              anthracnose: 'Spray Carbendazim before flowering',
                              powdery_mildew: 'Use sulfur-based fungicides',
                              fruit_fly: 'Use fruit fly traps and bait sprays'
                        }
                  }
            };

            // General farming tips
            this.generalTips = [
                  '💧 Ensure proper drainage to prevent waterlogging',
                  '🌱 Use quality certified seeds from trusted sources',
                  '🧪 Test soil every 2-3 years for nutrient management',
                  '🔄 Practice crop rotation to maintain soil health',
                  '🐛 Implement Integrated Pest Management (IPM)',
                  '🌾 Maintain proper spacing between plants',
                  '☀️ Ensure adequate sunlight exposure',
                  '♻️ Use organic manure along with chemical fertilizers',
                  '📱 Monitor weather forecasts regularly',
                  '👨‍🌾 Consult local agricultural officers for specific advice'
            ];
      }

      /**
       * Identify crop from image (simulated - would use AI model in production)
       * @param {File|Blob} imageFile - Crop image
       * @returns {Object} Crop identification result
       */
      async identifyCrop(imageFile) {
            // In production, this would use a trained plant classification model
            // For now, return a demo response

            return {
                  detected: true,
                  crop: 'wheat', // This would be predicted by the model
                  confidence: 0.92,
                  message: 'Crop detected successfully! See recommendations below.'
            };
      }

      /**
       * Get crop information and solutions
       * @param {string} cropType - Type of crop
       * @returns {Object} Crop details with solutions
       */
      getCropInfo(cropType) {
            const crop = this.cropDatabase[cropType.toLowerCase()];

            if (!crop) {
                  return {
                        found: false,
                        message: 'Crop not found in database. Please try another image.',
                        availableCrops: Object.keys(this.cropDatabase)
                  };
            }

            return {
                  found: true,
                  name: {
                        hindi: crop.hindi,
                        english: crop.english,
                        emoji: crop.emoji
                  },
                  season: crop.season,
                  solutions: crop.solutions,
                  diseases: crop.diseases,
                  generalTips: this.generalTips.slice(0, 5) // Return top 5 general tips
            };
      }

      /**
       * Detect crop diseases (simulated)
       * @param {File|Blob} imageFile - Crop/leaf image
       * @returns {Object} Disease detection result
       */
      async detectDisease(imageFile) {
            // In production, this would use a disease classification model

            return {
                  detected: false,
                  healthy: true,
                  message: 'Plant appears healthy! Continue regular care.',
                  preventiveTips: [
                        'Monitor plants regularly for early signs',
                        'Maintain proper spacing for air circulation',
                        'Remove dead leaves and plant debris',
                        'Apply preventive fungicides during monsoon',
                        'Ensure balanced nutrition'
                  ]
            };
      }

      /**
       * Get weather-based recommendations
       * @param {string} cropType - Type of crop
       * @param {string} season - Current season
       * @returns {Array} Weather-based recommendations
       */
      getWeatherRecommendations(cropType, season) {
            const recommendations = [];

            // General recommendations based on season
            if (season.includes('summer') || season.includes('गर्मी')) {
                  recommendations.push('🌡️ Increase irrigation frequency during hot days');
                  recommendations.push('🌿 Provide shade for young plants if temperature exceeds 40°C');
                  recommendations.push('💦 Mulching recommended to conserve soil moisture');
            } else if (season.includes('monsoon') || season.includes('बरसात')) {
                  recommendations.push('☔ Ensure proper drainage to prevent waterlogging');
                  recommendations.push('🍄 Apply preventive fungicides against fungal diseases');
                  recommendations.push('🌱 Avoid fertilizer application during heavy rains');
            } else if (season.includes('winter') || season.includes('सर्दी')) {
                  recommendations.push('❄️ Protect crops from frost using smoke or sprinklers');
                  recommendations.push('💧 Reduce irrigation frequency');
                  recommendations.push('🌾 Good time for Rabi crop cultivation');
            }

            return recommendations;
      }

      /**
       * Get all available crops
       * @returns {Array} List of crops
       */
      getAvailableCrops() {
            return Object.keys(this.cropDatabase).map(key => ({
                  id: key,
                  name: this.cropDatabase[key].english,
                  hindi: this.cropDatabase[key].hindi,
                  emoji: this.cropDatabase[key].emoji
            }));
      }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
      module.exports = CropRecognizer;
}
