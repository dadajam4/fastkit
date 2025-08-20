
# @fastkit/vue-location

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-location/README-ja.md)

An extension library for Vue Router that provides route state management, type-safe query parameter operations, and route transition state tracking. Easily implement schema-based query operations, form management, and route matching.

## Features

- **LocationService**: Service class for centralized Vue Router state management
- **Type-safe Queries**: Schema-based query parameter operations
- **Route Transition Tracking**: State monitoring and loading display during route transitions
- **Form Management**: Form components linked with query parameters
- **Route Matching**: Match determination between current and specified routes
- **Full TypeScript Support**: Type safety through strict type definitions
- **Vue 3 Composition API**: Complete integration with reactive system
- **SSR Support**: Safe operation in server-side rendering environments
- **Lightweight Implementation**: Upper-level extension of Vue Router with no performance impact

## Installation

```bash
npm install @fastkit/vue-location
```

## Basic Usage

### LocationService Setup

```typescript
// main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { LocationService } from '@fastkit/vue-location'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/about', component: () => import('./pages/About.vue') },
    { path: '/users/:id', component: () => import('./pages/User.vue') },
    { path: '/search', component: () => import('./pages/Search.vue') }
  ]
})

const app = createApp(App)

app.use(router)

// Install LocationService
LocationService.install(app, { router })

app.mount('#app')
```

### Basic LocationService Usage

```vue
<template>
  <div>
    <h1>Navigation Sample</h1>

    <!-- Route information display -->
    <div class="route-info">
      <h2>Current Route</h2>
      <p><strong>Path:</strong> {{ location.currentRoute.path }}</p>
      <p><strong>Query:</strong> {{ JSON.stringify(location.currentRoute.query) }}</p>
      <p><strong>Hash:</strong> {{ location.currentRoute.hash || 'None' }}</p>
    </div>

    <!-- Transition state display -->
    <div v-if="location.transitioning" class="transitioning">
      <h3>Route transitioning...</h3>
      <p>Transition target: {{ location.transitioningTo?.path }}</p>
      <div class="transition-details">
        <p v-if="location.transitioning.path">Changing path</p>
        <p v-if="location.transitioning.hash">Changing hash</p>
        <p v-if="location.transitioning.query.length > 0">
          Changing query: {{ location.transitioning.query.join(', ') }}
        </p>
      </div>
    </div>

    <!-- Navigation buttons -->
    <div class="navigation">
      <h3>Navigation</h3>
      <div class="nav-buttons">
        <button
          @click="location.push('/')"
          :class="{ active: location.match('/') }"
        >
          Home
        </button>
        <button
          @click="location.push('/about')"
          :class="{ active: location.match('/about') }"
        >
          About
        </button>
        <button
          @click="location.push('/users/123')"
          :class="{ active: location.match('/users/123') }"
        >
          User Page
        </button>
      </div>
    </div>

    <!-- Query operations -->
    <div class="query-operations">
      <h3>Query Operations</h3>
      <div class="query-buttons">
        <button @click="addSearchQuery">Add Search Query</button>
        <button @click="addFilterQuery">Add Filter Query</button>
        <button @click="clearQueries">Clear Queries</button>
      </div>

      <div class="current-queries">
        <h4>Current Query Parameters</h4>
        <ul>
          <li v-for="(value, key) in location.currentRoute.query" :key="key">
            <strong>{{ key }}:</strong> {{ value }}
          </li>
          <li v-if="Object.keys(location.currentRoute.query).length === 0">
            No query parameters
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocationService } from '@fastkit/vue-location'

const location = useLocationService()

const addSearchQuery = () => {
  location.pushQuery({ search: 'vue.js', category: 'frontend' })
}

const addFilterQuery = () => {
  location.pushQuery({ filter: 'active', sort: 'date' })
}

const clearQueries = () => {
  location.push({ path: location.currentRoute.path })
}

// Watch route changes
location.watchRoute((newRoute, oldRoute) => {
  console.log('Route changed:', {
    from: oldRoute?.path,
    to: newRoute.path,
    query: newRoute.query
  })
})
</script>

<style>
.route-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.route-info h2 {
  margin: 0 0 15px 0;
  color: #495057;
}

.route-info p {
  margin: 8px 0;
  font-family: monospace;
  background: white;
  padding: 8px;
  border-radius: 4px;
}

.transitioning {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.transitioning h3 {
  margin: 0 0 10px 0;
  color: #856404;
}

.transition-details p {
  margin: 5px 0;
  color: #856404;
  font-size: 14px;
}

.navigation, .query-operations {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.navigation h3, .query-operations h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.nav-buttons, .query-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.nav-buttons button, .query-buttons button {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-buttons button:hover, .query-buttons button:hover {
  background: #007bff;
  color: white;
}

.nav-buttons button.active {
  background: #007bff;
  color: white;
  font-weight: bold;
}

.current-queries {
  margin-top: 15px;
}

.current-queries h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 16px;
}

.current-queries ul {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
}

.current-queries li {
  margin: 5px 0;
  font-family: monospace;
  font-size: 14px;
}
</style>
```

### Type-safe Query Usage

```vue
<template>
  <div>
    <h1>Search Page</h1>

    <!-- Search form -->
    <form @submit.prevent="search.submit()" class="search-form">
      <div class="form-group">
        <label for="keyword">Keyword:</label>
        <input
          id="keyword"
          v-model="search.values.keyword"
          type="text"
          placeholder="Enter search keyword"
        >
      </div>

      <div class="form-group">
        <label for="category">Category:</label>
        <select id="category" v-model="search.values.category">
          <option value="">All</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="mobile">Mobile</option>
          <option value="devops">DevOps</option>
        </select>
      </div>

      <div class="form-group">
        <label for="sort">Sort by:</label>
        <select id="sort" v-model="search.values.sort">
          <option value="relevance">Relevance</option>
          <option value="date">Date</option>
          <option value="popularity">Popularity</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div class="form-group">
        <label for="limit">Items per page:</label>
        <select id="limit" v-model="search.values.limit">
          <option :value="10">10 items</option>
          <option :value="20">20 items</option>
          <option :value="50">50 items</option>
          <option :value="100">100 items</option>
        </select>
      </div>

      <div class="form-group">
        <label>
          <input
            v-model="search.values.includeArchived"
            type="checkbox"
          >
          Include archived items
        </label>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          :disabled="search.sending || !search.hasChanged"
          class="submit-button"
        >
          <span v-if="search.sending">Searching...</span>
          <span v-else>Search</span>
        </button>

        <button
          type="button"
          @click="search.reset()"
          :disabled="search.sending"
          class="reset-button"
        >
          Reset
        </button>

        <button
          type="button"
          @click="clearSearch()"
          :disabled="search.sending"
          class="clear-button"
        >
          Clear
        </button>
      </div>
    </form>

    <!-- Current search conditions display -->
    <div class="current-search">
      <h3>Current Search Conditions</h3>
      <div class="search-params">
        <div v-if="query.keyword" class="param">
          <strong>Keyword:</strong> {{ query.keyword }}
        </div>
        <div v-if="query.category" class="param">
          <strong>Category:</strong> {{ getCategoryLabel(query.category) }}
        </div>
        <div class="param">
          <strong>Sort:</strong> {{ getSortLabel(query.sort) }}
        </div>
        <div class="param">
          <strong>Items per page:</strong> {{ query.limit }} items
        </div>
        <div v-if="query.includeArchived" class="param">
          <strong>Archive:</strong> Included
        </div>
      </div>
    </div>

    <!-- Change status display -->
    <div v-if="search.hasChanged" class="changes">
      <h4>Changed Items</h4>
      <ul>
        <li v-for="change in search.changes" :key="change">
          {{ getFieldLabel(change) }}
        </li>
      </ul>
    </div>

    <!-- Search results display -->
    <div class="search-results">
      <h3>Search Results ({{ searchResults.length }} items)</h3>
      <div v-if="searchResults.length === 0" class="no-results">
        No search results found
      </div>
      <div v-else class="results-list">
        <div v-for="result in searchResults" :key="result.id" class="result-item">
          <h4>{{ result.title }}</h4>
          <p>{{ result.description }}</p>
          <div class="result-meta">
            <span class="category">{{ getCategoryLabel(result.category) }}</span>
            <span class="date">{{ formatDate(result.date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useLocationService } from '@fastkit/vue-location'

// Search query schema definition
const searchSchema = {
  keyword: { type: String, default: '' },
  category: { type: String, default: '' },
  sort: { type: String, default: 'relevance' },
  limit: { type: Number, default: 20 },
  includeArchived: { type: Boolean, default: false }
}

const location = useLocationService()
const query = location.useQuery(searchSchema)
const search = query.$form()

// Label definitions
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    mobile: 'Mobile',
    devops: 'DevOps'
  }
  return labels[category] || category
}

const getSortLabel = (sort: string) => {
  const labels: Record<string, string> = {
    relevance: 'Relevance',
    date: 'Date',
    popularity: 'Popularity',
    title: 'Title'
  }
  return labels[sort] || sort
}

const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    keyword: 'Keyword',
    category: 'Category',
    sort: 'Sort',
    limit: 'Items per page',
    includeArchived: 'Include archived'
  }
  return labels[field] || field
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP')
}

// Mock data for search results
interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  date: string
}

const searchResults = computed<SearchResult[]>(() => {
  // In actual applications, API calls would be made here
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Vue.js 3 Beginner Guide',
      description: 'Basic usage of Vue.js 3 and explanation of Composition API',
      category: 'frontend',
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'TypeScript and Vue Router Integration',
      description: 'How to implement type-safe Vue Router with TypeScript',
      category: 'frontend',
      date: '2024-01-20'
    },
    {
      id: '3',
      title: 'REST API Development with Node.js',
      description: 'How to build REST APIs using Express.js',
      category: 'backend',
      date: '2024-01-25'
    }
  ]

  // Filtering logic
  let filtered = mockResults

  if (query.keyword) {
    const keyword = query.keyword.toLowerCase()
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }

  if (query.category) {
    filtered = filtered.filter(item => item.category === query.category)
  }

  // Sorting
  if (query.sort === 'date') {
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } else if (query.sort === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title))
  }

  // Limit results
  return filtered.slice(0, query.limit)
})

const clearSearch = () => {
  location.push({ path: '/search' })
}

// Monitor query changes to update search results
watch(query.$watchKey, () => {
  console.log('Search conditions changed:', {
    keyword: query.keyword,
    category: query.category,
    sort: query.sort,
    limit: query.limit,
    includeArchived: query.includeArchived
  })
})
</script>

<style>
.search-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.submit-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.submit-button:hover:not(:disabled) {
  background: #0056b3;
}

.submit-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.reset-button,
.clear-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.reset-button:hover:not(:disabled),
.clear-button:hover:not(:disabled) {
  background: #545b62;
}

.current-search {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.current-search h3 {
  margin: 0 0 10px 0;
  color: #1976d2;
}

.search-params {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.param {
  background: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 14px;
}

.changes {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.changes h4 {
  margin: 0 0 10px 0;
  color: #856404;
}

.changes ul {
  margin: 0;
  padding-left: 20px;
}

.changes li {
  color: #856404;
}

.search-results {
  margin: 20px 0;
}

.search-results h3 {
  color: #495057;
  margin-bottom: 15px;
}

.no-results {
  text-align: center;
  color: #6c757d;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
}

.results-list {
  display: grid;
  gap: 15px;
}

.result-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.2s ease;
}

.result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-item h4 {
  margin: 0 0 10px 0;
  color: #007bff;
}

.result-item p {
  margin: 0 0 10px 0;
  color: #6c757d;
  line-height: 1.5;
}

.result-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
}

.category {
  background: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
}

.date {
  color: #6c757d;
}
</style>
```

### Route Transition State Monitoring

```vue
<template>
  <div>
    <h1>Loading State Display</h1>

    <!-- Global loading indicator -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner"></div>
      <p>Loading page...</p>
    </div>

    <!-- Query only loading display -->
    <div v-if="isQueryOnlyLoading" class="query-loading">
      <div class="loading-bar"></div>
      <p>Updating filters...</p>
    </div>

    <!-- Navigation menu -->
    <nav class="navigation">
      <div class="nav-links">
        <router-link
          to="/"
          class="nav-link"
          :class="{ loading: isNavigatingTo('/') }"
        >
          Home
          <span v-if="isNavigatingTo('/')" class="nav-spinner"></span>
        </router-link>

        <router-link
          to="/about"
          class="nav-link"
          :class="{ loading: isNavigatingTo('/about') }"
        >
          About
          <span v-if="isNavigatingTo('/about')" class="nav-spinner"></span>
        </router-link>

        <router-link
          to="/products"
          class="nav-link"
          :class="{ loading: isNavigatingTo('/products') }"
        >
          Products
          <span v-if="isNavigatingTo('/products')" class="nav-spinner"></span>
        </router-link>

        <button
          @click="loadHeavyPage"
          class="nav-link button"
          :class="{ loading: isNavigatingTo('/heavy') }"
          :disabled="isNavigatingTo('/heavy')"
        >
          Heavy Page
          <span v-if="isNavigatingTo('/heavy')" class="nav-spinner"></span>
        </button>
      </div>
    </nav>

    <!-- Filter controls -->
    <div class="filter-controls">
      <h3>Filter Controls</h3>
      <div class="filter-buttons">
        <button
          @click="applyFilter('category', 'electronics')"
          :disabled="isFilterLoading"
          class="filter-button"
        >
          Electronics
        </button>
        <button
          @click="applyFilter('category', 'clothing')"
          :disabled="isFilterLoading"
          class="filter-button"
        >
          Clothing
        </button>
        <button
          @click="applyFilter('sort', 'price')"
          :disabled="isFilterLoading"
          class="filter-button"
        >
          By Price
        </button>
        <button
          @click="clearFilters"
          :disabled="isFilterLoading"
          class="filter-button clear"
        >
          Clear
        </button>
      </div>

      <div v-if="isFilterLoading" class="filter-loading">
        Applying filters...
      </div>
    </div>

    <!-- Transition state details -->
    <div class="transition-details">
      <h3>Transition State Details</h3>
      <div class="status-grid">
        <div class="status-item">
          <strong>Current Path:</strong>
          <span>{{ location.currentRoute.path }}</span>
        </div>

        <div v-if="location.transitioningTo" class="status-item">
          <strong>Transition Target Path:</strong>
          <span>{{ location.transitioningTo.path }}</span>
        </div>

        <div class="status-item">
          <strong>Transitioning:</strong>
          <span :class="isLoading ? 'text-warning' : 'text-success'">
            {{ isLoading ? 'Yes' : 'No' }}
          </span>
        </div>

        <div class="status-item">
          <strong>Query Only Transition:</strong>
          <span :class="isQueryOnlyLoading ? 'text-warning' : 'text-success'">
            {{ isQueryOnlyLoading ? 'Yes' : 'No' }}
          </span>
        </div>

        <div v-if="location.transitioning?.query.length" class="status-item">
          <strong>Changing Queries:</strong>
          <span>{{ location.transitioning.query.join(', ') }}</span>
        </div>
      </div>
    </div>

    <!-- Performance metrics -->
    <div class="performance-metrics">
      <h3>Performance Metrics</h3>
      <div class="metrics-grid">
        <div class="metric">
          <strong>Navigation Count:</strong>
          <span>{{ navigationCount }}</span>
        </div>
        <div class="metric">
          <strong>Last Navigation Time:</strong>
          <span>{{ lastNavigationTime }}ms</span>
        </div>
        <div class="metric">
          <strong>Average Navigation Time:</strong>
          <span>{{ averageNavigationTime }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLocationService } from '@fastkit/vue-location'

const location = useLocationService()
const navigationCount = ref(0)
const navigationTimes = ref<number[]>([])
const navigationStartTime = ref<number | null>(null)

// Loading state
const isLoading = computed(() => !!location.transitioning)
const isQueryOnlyLoading = computed(() =>
  location.isQueryOnlyTransitioning()
)
const isFilterLoading = computed(() =>
  location.isQueryOnlyTransitioning(['category', 'sort', 'filter'])
)

// Check transition state to specific path
const isNavigatingTo = (path: string) => {
  return location.transitioningTo?.path === path
}

// Performance measurement
const lastNavigationTime = computed(() =>
  navigationTimes.value[navigationTimes.value.length - 1] || 0
)

const averageNavigationTime = computed(() => {
  if (navigationTimes.value.length === 0) return 0
  const sum = navigationTimes.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / navigationTimes.value.length)
})

// Monitor navigation
location.watchRoute((newRoute, oldRoute) => {
  if (oldRoute) {
    navigationCount.value++

    if (navigationStartTime.value) {
      const duration = Date.now() - navigationStartTime.value
      navigationTimes.value.push(duration)

      // Keep up to 100 items
      if (navigationTimes.value.length > 100) {
        navigationTimes.value.shift()
      }
    }
  }

  // Reset for next transition
  navigationStartTime.value = null
})

// Detect transition start with router hook
location.router.beforeEach(() => {
  navigationStartTime.value = Date.now()
})

// Load heavy page (simulation)
const loadHeavyPage = async () => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  location.push('/heavy')
}

// Apply filters
const applyFilter = (key: string, value: string) => {
  location.pushQuery({ [key]: value })
}

const clearFilters = () => {
  location.push({ path: location.currentRoute.path })
}
</script>

<style>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  text-align: center;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.query-loading {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 10px 20px;
  margin: 10px 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-bar {
  width: 20px;
  height: 4px;
  background: #ffc107;
  border-radius: 2px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.navigation {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.nav-links {
  display: flex;
  gap: 15px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  text-decoration: none;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-link.button {
  font-size: inherit;
  font-family: inherit;
}

.nav-link:hover:not(.loading):not(:disabled) {
  background: #007bff;
  color: white;
}

.nav-link.loading {
  background: #6c757d;
  color: white;
  cursor: not-allowed;
}

.nav-link:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.nav-spinner {
  width: 12px;
  height: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-left: 1px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.filter-controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.filter-controls h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.filter-button {
  padding: 6px 12px;
  border: 1px solid #6c757d;
  background: white;
  color: #6c757d;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-button:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

.filter-button.clear {
  border-color: #dc3545;
  color: #dc3545;
}

.filter-button.clear:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}

.filter-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-loading {
  color: #856404;
  font-style: italic;
  font-size: 14px;
}

.transition-details,
.performance-metrics {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.transition-details h3,
.performance-metrics h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.status-grid,
.metrics-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.status-item,
.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.text-warning {
  color: #ffc107;
  font-weight: bold;
}

.text-success {
  color: #28a745;
  font-weight: bold;
}
</style>
```

## Advanced Usage Examples

### Custom Route Matching

```typescript
// Custom matching logic implementation
import { useLocationService } from '@fastkit/vue-location'

const useAdvancedRouteMatching = () => {
  const location = useLocationService()

  // Matching with path parameters
  const matchesUserRoute = (userId?: string) => {
    const current = location.currentRoute
    if (current.name !== 'user-detail') return false
    if (userId && current.params.id !== userId) return false
    return true
  }

  // Matching with query parameters
  const matchesSearchRoute = (filters?: Record<string, string>) => {
    if (!location.match('/search')) return false
    if (!filters) return true

    return Object.entries(filters).every(([key, value]) =>
      location.currentRoute.query[key] === value
    )
  }

  // Adaptive navigation
  const smartNavigate = (target: string, fallback: string = '/') => {
    if (location.isAvailable(target)) {
      return location.push(target)
    } else {
      console.warn(`Route ${target} is not available, redirecting to ${fallback}`)
      return location.push(fallback)
    }
  }

  return {
    matchesUserRoute,
    matchesSearchRoute,
    smartNavigate
  }
}
```

### Advanced Query Parameter Validation

```typescript
// Advanced query schema definition
const advancedSearchSchema = {
  // String field
  keyword: {
    type: String,
    default: '',
    validate: (value: string) => {
      if (value.length > 100) {
        throw new Error('Keywords must be 100 characters or less')
      }
      return value.trim()
    }
  },

  // Number field
  page: {
    type: Number,
    default: 1,
    validate: (value: number) => {
      if (value < 1) {
        throw new Error('Page number must be 1 or greater')
      }
      if (value > 1000) {
        throw new Error('Page number must be 1000 or less')
      }
      return Math.floor(value)
    }
  },

  // Array field
  categories: {
    type: Array,
    default: [],
    validate: (value: string[]) => {
      const validCategories = ['tech', 'design', 'business', 'science']
      const invalid = value.filter(cat => !validCategories.includes(cat))
      if (invalid.length > 0) {
        throw new Error(`Invalid categories: ${invalid.join(', ')}`)
      }
      return [...new Set(value)] // Remove duplicates
    }
  },

  // Custom type field
  dateRange: {
    type: Object,
    default: () => ({ start: null, end: null }),
    serialize: (value: { start: Date | null, end: Date | null }) => {
      if (!value.start && !value.end) return undefined
      return JSON.stringify({
        start: value.start?.toISOString(),
        end: value.end?.toISOString()
      })
    },
    deserialize: (value: string) => {
      try {
        const parsed = JSON.parse(value)
        return {
          start: parsed.start ? new Date(parsed.start) : null,
          end: parsed.end ? new Date(parsed.end) : null
        }
      } catch {
        return { start: null, end: null }
      }
    },
    validate: (value: { start: Date | null, end: Date | null }) => {
      if (value.start && value.end && value.start > value.end) {
        throw new Error('Start date must be before end date')
      }
      return value
    }
  }
}
```

## API Reference

### LocationService

```typescript
class LocationService {
  readonly router: Router
  readonly state: LocationServiceState
  readonly currentRoute: RouteLocationNormalizedLoaded
  readonly transitioningTo: _RouteLocationBase | null
  readonly transitioning: LocationTransitioning | null

  // Route monitoring
  watchRoute<Immediate extends boolean>(
    cb: WatchCallback<RouteLocationNormalizedLoaded>,
    options?: WatchRouteOptions<Immediate>
  ): WatchStopHandle

  // Route matching
  locationIsMatched(target: RouteLocationRaw): boolean
  match(raw?: RouteLocationRaw, opts?: SameRouteCheckOptions): boolean
  isAvailable(raw?: RouteLocationRaw): boolean

  // Query operations
  useQuery<Schema extends QueriesSchema>(schema: Schema): TypedQuery<Schema>
  getQuery(key: string, type?: RouteQueryType, defaultValue?: any): any
  getQueryMergedLocation(query: LocationQueryRaw, route?: RouteLocationNormalizedLoaded): _RouteLocationBase

  // Navigation
  push(...args: Parameters<Router['push']>): ReturnType<Router['push']>
  pushQuery(query: LocationQueryRaw): ReturnType<Router['push']>
  replace(...args: Parameters<Router['replace']>): ReturnType<Router['replace']>
  replaceQuery(query: LocationQueryRaw): ReturnType<Router['replace']>
  go(...args: Parameters<Router['go']>): ReturnType<Router['go']>
  back(...args: Parameters<Router['back']>): ReturnType<Router['back']>
  forward(...args: Parameters<Router['forward']>): ReturnType<Router['forward']>

  // Transition state
  isQueryOnlyTransitioning(queries?: string | string[]): boolean

  // Component retrieval
  getMatchedComponents(raw?: RouteLocationRaw): RawRouteComponent[]

  // Installation
  static install(app: App, ctx: LocationServiceContext): LocationService
}
```

### useLocationService

```typescript
function useLocationService(): LocationService
```

### TypedQuery

```typescript
interface TypedQuery<Schema extends QueriesSchema> {
  // Service access
  readonly $service: LocationService
  readonly $router: Router
  readonly $currentRoute: RouteLocationNormalizedLoaded

  // State
  readonly $transitioningQueries: (keyof Schema)[]
  readonly $transitioning: boolean
  readonly $sending: boolean
  readonly $watchKey: ComputedRef<string>

  // Extractor
  readonly $extractors: QueriesExtractor<Schema>
  readonly $states: TypedQueryExtractStates<Schema>

  // Utility
  $ensure<K extends keyof Schema>(queryKey: K): Exclude<InferQueryType<Schema[K]>, undefined>
  $serialize(values: ExtractQueryInputs<Schema>, mergeCurrentValues?: boolean): LocationQuery
  $serializeCurrentValues(): LocationQuery
  $location(values: ExtractQueryInputs<Schema>, options?: TypedQueryRouteOptions): ReturnType<Router['resolve']>
  $push(values: ExtractQueryInputs<Schema>, options?: TypedQueryRouteOptions): ReturnType<Router['push']>
  $replace(values: ExtractQueryInputs<Schema>, options?: TypedQueryRouteOptions): ReturnType<Router['replace']>
  $form(options?: TypedQueryFormSubmitOptions): TypedQueryForm<Schema>
}
```

### TypedQueryForm

```typescript
interface TypedQueryForm<Schema extends QueriesSchema> {
  readonly ctx: TypedQuery<Schema>
  readonly to?: RouteLocationRaw
  readonly behavior: TypedQueryFormSubmitBehavior
  readonly query: Readonly<ExtractQueryTypes<Schema>>
  readonly values: ExtractQueryTypes<Schema>
  readonly changes: (keyof Schema)[]
  readonly hasChanged: boolean
  readonly transitioningQueries: (keyof Schema)[]
  readonly transitioning: boolean
  readonly sending: boolean
  readonly watchKey: ComputedRef<string>

  reset(): void
  submit(options?: TypedQueryFormSubmitOptions): ReturnType<Router['push']>
}
```

### Utility Functions

```typescript
function locationIsMatched(router: Router, target: RouteLocationRaw): boolean
function pickShallowRoute(route: _RouteLocationBase): _RouteLocationBase
```

## Performance Optimization

### Memory Leak Prevention

```typescript
// Proper cleanup in components
import { onBeforeUnmount } from 'vue'
import { useLocationService } from '@fastkit/vue-location'

const useRouteWatcher = () => {
  const location = useLocationService()

  // Automatic cleanup with autoStop: true (default)
  const stopWatcher = location.watchRoute((route) => {
    console.log('Route changed:', route.path)
  }, { autoStop: true })

  // Manual cleanup when needed
  onBeforeUnmount(() => {
    stopWatcher()
  })
}
```

### Optimization for Large Queries

```typescript
// Query debounce processing
import { debounce } from 'lodash-es'

const useOptimizedQuery = <T extends QueriesSchema>(schema: T) => {
  const location = useLocationService()
  const query = location.useQuery(schema)

  // Debounced update function
  const debouncedPush = debounce(
    (values: any) => query.$push(values),
    300
  )

  return {
    ...query,
    pushDebounced: debouncedPush
  }
}
```

## Related Packages

- `vue-router` - Vue Router 4.x
- `@fastkit/vue-utils` - Vue.js development utilities

## License

MIT
