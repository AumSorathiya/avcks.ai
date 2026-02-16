/**
 * Memory.js
 * Centralized LocalStorage wrapper
 */

export class MemoryModule {
    constructor() { }

    set(key, value) {
        localStorage.setItem(`avcks_${key}`, value);
    }

    get(key) {
        return localStorage.getItem(`avcks_${key}`);
    }

    remove(key) {
        localStorage.removeItem(`avcks_${key}`);
    }

    // Specialized stores
    storeFact(key, value) {
        const facts = JSON.parse(this.get('facts') || '{}');
        facts[key] = value;
        this.set('facts', JSON.stringify(facts));
    }

    getFact(key) {
        const facts = JSON.parse(this.get('facts') || '{}');
        return facts[key];
    }

    // Routines
    storeRoutine(trigger, steps) {
        const routines = JSON.parse(this.get('routines') || '{}');
        routines[trigger.toLowerCase()] = steps;
        this.set('routines', JSON.stringify(routines));
    }

    getRoutines() {
        return JSON.parse(this.get('routines') || '{}');
    }

    // Preferences (home, work, etc)
    storePreference(key, value) {
        const prefs = JSON.parse(this.get('preferences') || '{}');
        prefs[key] = value;
        this.set('preferences', JSON.stringify(prefs));
    }

    getPreference(key) {
        const prefs = JSON.parse(this.get('preferences') || '{}');
        return prefs[key];
    }

    // Profiles
    saveProfile(data) {
        const profile = JSON.parse(this.get('profile') || '{}');
        const updated = { ...profile, ...data };
        this.set('profile', JSON.stringify(updated));
        return updated;
    }

    getProfile() {
        return JSON.parse(this.get('profile') || '{}');
    }

    // Productivity: Notes
    addNote(text) {
        const notes = JSON.parse(this.get('notes') || '[]');
        notes.push({ text, date: new Date().toLocaleString() });
        this.set('notes', JSON.stringify(notes));
    }

    getNotes() {
        return JSON.parse(this.get('notes') || '[]');
    }

    deleteNote(index) {
        const notes = JSON.parse(this.get('notes') || '[]');
        if (index >= 0 && index < notes.length) {
            notes.splice(index, 1);
            this.set('notes', JSON.stringify(notes));
            return true;
        }
        return false;
    }

    // Productivity: Todos
    addTodo(text) {
        const todos = JSON.parse(this.get('todos') || '[]');
        todos.push({ text, completed: false, date: new Date().toLocaleString() });
        this.set('todos', JSON.stringify(todos));
    }

    getTodos() {
        return JSON.parse(this.get('todos') || '[]');
    }

    completeTodo(index) {
        const todos = JSON.parse(this.get('todos') || '[]');
        if (index >= 0 && index < todos.length) {
            const item = todos[index];
            todos.splice(index, 1);
            this.set('todos', JSON.stringify(todos));
            return item;
        }
        return null;
    }

    // Timers Persistence
    storeTimer(endTime, label, timerId = null) {
        const timers = JSON.parse(this.get('timers') || '[]');
        const id = timerId || Date.now();
        timers.push({ endTime, label, id });
        this.set('timers', JSON.stringify(timers));
        return id; // Return the ID so caller can use it for cleanup
    }

    getTimers() {
        return JSON.parse(this.get('timers') || '[]');
    }

    removeTimer(id) {
        let timers = JSON.parse(this.get('timers') || '[]');
        timers = timers.filter(t => t.id !== id);
        this.set('timers', JSON.stringify(timers));
    }
}

