import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from '../../config/i18n';

// Mock data for liked posts
const mockLikedPosts = [
  {
    id: '1',
    title: 'Vintage Camera Collection',
    price: '$120',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    seller: 'CameraLover',
    date: '2 days ago'
  },
  {
    id: '2',
    title: 'Handmade Leather Wallet',
    price: '$45',
    image: 'https://images.unsplash.com/photo-1549318061-5d6c36ff5d7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    seller: 'LeatherCrafts',
    date: '1 week ago'
  },
  {
    id: '3',
    title: 'Antique Wooden Chair',
    price: '$85',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    seller: 'VintageFinds',
    date: '3 weeks ago'
  },
];

const LikedPostsScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.postCard}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.postDetails}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postPrice}>{item.price}</Text>
        <View style={styles.postMeta}>
          <Text style={styles.postSeller}>{item.seller}</Text>
          <Text style={styles.postDate}>{item.date}</Text>
        </View>
      </View>
      <MaterialIcons name="favorite" size={24} color="#ff4757" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#5e72e4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('PROFILE.LIKED_PRODUCTS')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {mockLikedPosts.length > 0 ? (
        <FlatList
          data={mockLikedPosts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="favorite-border" size={48} color="#adb5bd" />
          <Text style={styles.emptyText}>No liked items yet</Text>
          <Text style={styles.emptySubtext}>Items you like will appear here</Text>
        </View>
      )}
    </View>
  );
};

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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    color: '#32325d',
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  postDetails: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
    color: '#32325d',
    marginBottom: 4,
  },
  postPrice: {
    fontSize: 14,
    fontFamily: 'Tajawal-Bold',
    color: '#5e72e4',
    marginBottom: 4,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postSeller: {
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
    color: '#6e6e6e',
  },
  postDate: {
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
    color: '#adb5bd',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    color: '#32325d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
    color: '#6e6e6e',
    textAlign: 'center',
  },
});

export default LikedPostsScreen;