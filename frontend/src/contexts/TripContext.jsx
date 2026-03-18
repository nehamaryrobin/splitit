import { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api.js';
import { computeSettlements } from '../lib/settlement.js';

const TripContext = createContext(null);

const GUEST_KEY = 'splitit_guest_trip';

function loadGuest() {
  try {
    const raw = sessionStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveGuest(trip) {
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(trip));
}

const emptyTrip = (name = 'My Trip') => ({
  _id: 'guest',
  name,
  participants: [],
  categories: [],
  currency: '₹',
  expenses: [],
});

export function TripProvider({ children }) {
  const [trip, setTripState]         = useState(null);
  const [trips, setTrips]            = useState([]);       // dashboard list
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading]        = useState(false);

  // ── Helpers ─────────────────────────────────────────────────
  const updateTrip = (updater) => {
    setTripState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next?._id === 'guest') saveGuest(next);
      return next;
    });
  };

  // ── Guest mode ───────────────────────────────────────────────
  const startGuest = useCallback((name) => {
    const existing = loadGuest();
    const t = existing || emptyTrip(name);
    setTripState(t);
    setSettlements([]);
  }, []);

  const clearGuest = useCallback(() => {
    sessionStorage.removeItem(GUEST_KEY);
    setTripState(null);
    setSettlements([]);
  }, []);

  // ── Auth mode: dashboard ─────────────────────────────────────
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/trips');
      setTrips(data);
    } finally { setLoading(false); }
  }, []);

  const createTrip = useCallback(async (payload) => {
    const { data } = await api.post('/trips', payload);
    setTrips((prev) => [data, ...prev]);
    return data;
  }, []);

  const fetchTrip = useCallback(async (tripId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/trips/${tripId}`);
      setTripState(data);
      setSettlements([]);
      return data;
    } finally { setLoading(false); }
  }, []);

  const updateTripMeta = useCallback(async (tripId, payload) => {
    const { data } = await api.put(`/trips/${tripId}`, payload);
    setTripState(data);
    setTrips((prev) => prev.map((t) => (t._id === tripId ? { ...t, ...data } : t)));
  }, []);

  const deleteTrip = useCallback(async (tripId) => {
    await api.delete(`/trips/${tripId}`);
    setTrips((prev) => prev.filter((t) => t._id !== tripId));
    if (trip?._id === tripId) setTripState(null);
  }, [trip]);

  // ── Expenses ─────────────────────────────────────────────────
  const addExpense = useCallback(async (expense) => {
    if (trip._id === 'guest') {
      const newExp = { ...expense, _id: crypto.randomUUID(), category: expense.category || 'General' };
      updateTrip((t) => ({ ...t, expenses: [...t.expenses, newExp] }));
      return newExp;
    }
    const { data } = await api.post(`/trips/${trip._id}/expenses`, expense);
    updateTrip((t) => ({ ...t, expenses: [...t.expenses, data] }));
    return data;
  }, [trip]);

  const editExpense = useCallback(async (expenseId, updates) => {
    if (trip._id === 'guest') {
      updateTrip((t) => ({
        ...t,
        expenses: t.expenses.map((e) => e._id === expenseId ? { ...e, ...updates } : e),
      }));
      return;
    }
    const { data } = await api.put(`/trips/${trip._id}/expenses/${expenseId}`, updates);
    updateTrip((t) => ({
      ...t,
      expenses: t.expenses.map((e) => e._id === expenseId ? data : e),
    }));
  }, [trip]);

  const removeExpense = useCallback(async (expenseId) => {
    if (trip._id === 'guest') {
      updateTrip((t) => ({ ...t, expenses: t.expenses.filter((e) => e._id !== expenseId) }));
      return;
    }
    await api.delete(`/trips/${trip._id}/expenses/${expenseId}`);
    updateTrip((t) => ({ ...t, expenses: t.expenses.filter((e) => e._id !== expenseId) }));
  }, [trip]);

  // ── Participants & categories (local for guest, PUT for auth) ─
  const setParticipants = useCallback(async (participants) => {
    if (trip._id === 'guest') { updateTrip((t) => ({ ...t, participants })); return; }
    await updateTripMeta(trip._id, { ...trip, participants });
  }, [trip, updateTripMeta]);

  const setCategories = useCallback(async (categories) => {
    if (trip._id === 'guest') { updateTrip((t) => ({ ...t, categories })); return; }
    await updateTripMeta(trip._id, { ...trip, categories });
  }, [trip, updateTripMeta]);

  const setCurrency = useCallback(async (currency) => {
    if (trip._id === 'guest') { updateTrip((t) => ({ ...t, currency })); return; }
    await updateTripMeta(trip._id, { ...trip, currency });
  }, [trip, updateTripMeta]);

  // ── Settlements ──────────────────────────────────────────────
  const computeAndSettle = useCallback(async () => {
    if (!trip) return;
    if (trip._id === 'guest') {
      setSettlements(computeSettlements(trip.participants, trip.expenses));
      return;
    }
    const { data } = await api.get(`/trips/${trip._id}/settlements`);
    setSettlements(data.transactions);
  }, [trip]);

  return (
    <TripContext.Provider value={{
      trip, trips, settlements, loading,
      startGuest, clearGuest,
      fetchTrips, createTrip, fetchTrip, deleteTrip,
      addExpense, editExpense, removeExpense,
      setParticipants, setCategories, setCurrency,
      computeAndSettle,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}
