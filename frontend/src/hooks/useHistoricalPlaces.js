import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useHistoricalPlaces = (filters = {}) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    count: 0
  });

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        
        if (filters.province && filters.province !== 'All Provinces') {
          params.append('province', filters.province);
        }
        
        if (filters.artForm && filters.artForm !== 'All Art Forms') {
          params.append('artForm', filters.artForm);
        }
        
        if (filters.search) {
          params.append('search', filters.search);
        }
        
        if (filters.featured) {
          params.append('featured', 'true');
        }
        
        if (filters.page) {
          params.append('page', filters.page);
        }
        
        if (filters.limit) {
          params.append('limit', filters.limit);
        }

        const response = await axios.get(`${API_URL}/historical-places?${params.toString()}`);
        
        if (response.data.success) {
          setPlaces(response.data.data);
          setPagination({
            total: response.data.total,
            totalPages: response.data.totalPages,
            currentPage: response.data.currentPage,
            count: response.data.count
          });
        }
      } catch (err) {
        console.error('Error fetching historical places:', err);
        setError(err.response?.data?.message || 'Failed to fetch historical places');
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [filters.province, filters.artForm, filters.search, filters.featured, filters.page, filters.limit]);

  return { places, loading, error, pagination };
};

export const useHistoricalPlace = (id) => {
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlace = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/historical-places/${id}`);
        
        if (response.data.success) {
          setPlace(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching historical place:', err);
        setError(err.response?.data?.message || 'Failed to fetch historical place');
        setPlace(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id]);

  return { place, loading, error };
};