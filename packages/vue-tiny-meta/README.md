
# @fastkit/vue-tiny-meta

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-tiny-meta/README-ja.md)

A library for automatically extracting and analyzing type information and metadata from Vue components. Uses the TypeScript Compiler API to extract detailed type information such as Props, Events, and Slots from Vue components, enabling automatic documentation generation and Storybook configuration.

## Features

- **Automatic Type Extraction**: Vue component type information extraction using TypeScript Compiler API
- **Comprehensive Metadata**: Complete support for Props, Events, Slots, and JSDoc comments
- **Vite Plugin**: Automatic metadata injection during development
- **Storybook Integration**: Automatic generation of Storybook Controls
- **Complete TypeScript Support**: Type safety through strict type definitions
- **Customizable**: Filtering, resolution processing, and sorting functionality
- **High Performance**: Efficient analysis and caching capabilities
- **Developer Experience**: Automatic extraction of detailed JSDoc comments

## Installation

```bash
npm install @fastkit/vue-tiny-meta
```

## Basic Usage

### Vue Component Type Annotations

```typescript
// components/MyButton.tsx
import { defineComponent } from 'vue'

interface Props {
  /**
   * Button label text
   * @default "Click me"
   */
  label?: string

  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Button type
   */
  variant?: 'primary' | 'secondary' | 'danger'

  /**
   * Disabled state
   */
  disabled?: boolean

  /**
   * Loading state
   */
  loading?: boolean
}

/**
 * @vue-tiny-meta
 * Customizable button component
 *
 * @example
 * ```vue
 * <MyButton
 *   label="Save"
 *   size="large"
 *   variant="primary"
 *   @click="handleSave"
 * />
 * ```
 */
export default defineComponent<Props>({
  name: 'MyButton',

  props: {
    label: {
      type: String,
      default: 'Click me'
    },
    size: {
      type: String as PropType<Props['size']>,
      default: 'medium'
    },
    variant: {
      type: String as PropType<Props['variant']>,
      default: 'primary'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: {
    /**
     * Emitted when button is clicked
     * @param event - Mouse event
     */
    click: (event: MouseEvent) => true,

    /**
     * Emitted when button receives focus
     * @param event - Focus event
     */
    focus: (event: FocusEvent) => true,

    /**
     * Emitted when button loses focus
     * @param event - Blur event
     */
    blur: (event: FocusEvent) => true
  },

  slots: {
    /**
     * Button content
     * By default, the label property is displayed
     */
    default: (props: {}) => any,

    /**
     * Icon displayed on the left side of the button
     */
    'v-slot:prefix': (props: {}) => any,

    /**
     * Icon displayed on the right side of the button
     */
    'v-slot:suffix': (props: {}) => any,

    /**
     * Icon displayed during loading
     */
    'v-slot:loading': (props: {}) => any
  },

  setup(props, { emit, slots }) {
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) return
      emit('click', event)
    }

    const handleFocus = (event: FocusEvent) => {
      emit('focus', event)
    }

    const handleBlur = (event: FocusEvent) => {
      emit('blur', event)
    }

    return () => (
      <button
        class={[
          'my-button',
          `my-button--${props.size}`,
          `my-button--${props.variant}`,
          {
            'my-button--disabled': props.disabled,
            'my-button--loading': props.loading
          }
        ]}
        disabled={props.disabled || props.loading}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {props.loading && (
          <span class="my-button__loading">
            {slots.loading?.() || '⟳'}
          </span>
        )}

        {slots.prefix?.() && (
          <span class="my-button__prefix">
            {slots.prefix()}
          </span>
        )}

        <span class="my-button__content">
          {slots.default?.() || props.label}
        </span>

        {slots.suffix?.() && (
          <span class="my-button__suffix">
            {slots.suffix()}
          </span>
        )}
      </button>
    )
  }
})
```

### Programmatic Metadata Extraction

```typescript
// scripts/extract-components.ts
import { extractAll } from '@fastkit/vue-tiny-meta'

// Extract metadata from component files
async function extractComponentMeta() {
  const componentPath = './src/components/MyButton.tsx'

  const metadata = extractAll(componentPath, {
    // Ignore specific props
    ignoreProps: ['class', 'style', 'key'],

    // Ignore specific events
    ignoreEvents: ['onVnodeBeforeMount', 'onVnodeMounted'],

    // Props resolution processing
    resolvers: {
      prop: (prop) => {
        // Standardize default value format
        if (prop.defaultValue) {
          prop.defaultValue.value = prop.defaultValue.value.replace(/['"]/g, '"')
        }
        return prop
      }
    },

    // Specify sort order
    sort: ['label', 'size', 'variant', 'disabled', 'loading']
  })

  console.log('Extracted metadata:', JSON.stringify(metadata, null, 2))

  return metadata
}

extractComponentMeta()
```

### Automatic Injection with Vite Plugin

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ViteVueTinyMeta } from '@fastkit/vue-tiny-meta/vite'

export default defineConfig({
  plugins: [
    vue(),
    ViteVueTinyMeta({
      // Target only TypeScript/TSX files
      include: /\.(ts|tsx)$/,

      // Exclude node_modules
      exclude: /node_modules/,

      // Property name to inject metadata
      injectProperty: '__docgenInfo',

      // Component analysis options
      ignoreProps: (baseRules) => [
        ...baseRules,
        'class',
        'style',
        /^data-/
      ],

      resolvers: {
        prop: (prop) => {
          // Custom resolution processing
          if (prop.name.startsWith('_')) {
            return false // Hide
          }
          return prop
        }
      }
    })
  ]
})
```

### Runtime Metadata Access

```vue
<template>
  <div class="component-docs">
    <h2>{{ componentName }} Component</h2>

    <div class="description">
      {{ description }}
    </div>

    <!-- Props list -->
    <section class="props-section">
      <h3>Props</h3>
      <div class="props-table">
        <div
          v-for="prop in props"
          :key="prop.name"
          class="prop-row"
        >
          <div class="prop-name">
            {{ prop.name }}
            <span v-if="prop.required" class="required">*</span>
          </div>
          <div class="prop-type">{{ prop.type.name }}</div>
          <div class="prop-default">
            {{ prop.defaultValue?.value || '-' }}
          </div>
          <div class="prop-description">
            {{ prop.description || '-' }}
          </div>
        </div>
      </div>
    </section>

    <!-- Events list -->
    <section class="events-section">
      <h3>Events</h3>
      <div class="events-table">
        <div
          v-for="event in events"
          :key="event.name"
          class="event-row"
        >
          <div class="event-name">{{ event.name }}</div>
          <div class="event-type">{{ event.type.names.join(' | ') }}</div>
          <div class="event-description">
            {{ event.description || '-' }}
          </div>
        </div>
      </div>
    </section>

    <!-- Slots list -->
    <section class="slots-section">
      <h3>Slots</h3>
      <div class="slots-table">
        <div
          v-for="slot in slots"
          :key="slot.name"
          class="slot-row"
        >
          <div class="slot-name">{{ slot.name }}</div>
          <div class="slot-required">
            {{ slot.required ? 'Yes' : 'No' }}
          </div>
          <div class="slot-description">
            {{ slot.description || '-' }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MyButton from './MyButton'

// Get metadata injected by Vite plugin
const componentMeta = computed(() => {
  return (MyButton as any).__docgenInfo || {}
})

const componentName = computed(() => componentMeta.value.displayName || 'Unknown')
const description = computed(() => componentMeta.value.description || '')
const props = computed(() => componentMeta.value.props || [])
const events = computed(() => componentMeta.value.events || [])
const slots = computed(() => componentMeta.value.slots || [])
</script>

<style scoped>
.component-docs {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.description {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #007acc;
}

.props-section,
.events-section,
.slots-section {
  margin: 30px 0;
}

.props-table,
.events-table,
.slots-table {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.prop-row,
.event-row,
.slot-row {
  display: grid;
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 0.9em;
}

.prop-row {
  grid-template-columns: 200px 150px 100px 1fr;
}

.event-row {
  grid-template-columns: 200px 200px 1fr;
}

.slot-row {
  grid-template-columns: 200px 100px 1fr;
}

.prop-name,
.event-name,
.slot-name {
  font-weight: bold;
  color: #333;
}

.required {
  color: #e74c3c;
  margin-left: 4px;
}

.prop-type,
.event-type {
  font-family: monospace;
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8em;
}

.prop-default {
  font-family: monospace;
  color: #666;
}

.prop-description,
.event-description,
.slot-description {
  color: #666;
}
</style>
```

## Storybook Integration

### Automatic Storybook Controls Generation

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-controls'
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  async viteFinal(config) {
    // Add vue-tiny-meta Vite plugin
    config.plugins?.push(
      ViteVueTinyMeta({
        include: /\.(ts|tsx)$/,
        injectProperty: '__docgenInfo'
      })
    )
    return config
  }
}

export default config
```

```typescript
// src/components/MyButton.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { generateControls } from '@fastkit/vue-tiny-meta/storybook'
import MyButton from './MyButton'

// Automatically generate controls from component metadata
const controls = generateControls(MyButton.__docgenInfo)

const meta: Meta<typeof MyButton> = {
  title: 'Components/MyButton',
  component: MyButton,
  parameters: {
    docs: {
      description: {
        component: MyButton.__docgenInfo?.description
      }
    }
  },
  argTypes: {
    ...controls,

    // Add custom controls
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger']
    },

    // Event handlers
    onClick: { action: 'clicked' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    label: 'Click me',
    size: 'medium',
    variant: 'primary'
  }
}

// Variation stories
export const Primary: Story = {
  args: {
    label: 'Save',
    variant: 'primary'
  }
}

export const Secondary: Story = {
  args: {
    label: 'Cancel',
    variant: 'secondary'
  }
}

export const Danger: Story = {
  args: {
    label: 'Delete',
    variant: 'danger'
  }
}

export const Loading: Story = {
  args: {
    label: 'Processing...',
    loading: true
  }
}

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true
  }
}

export const WithSlots: Story = {
  args: {
    label: 'Button with Icon'
  },
  render: (args) => ({
    components: { MyButton },
    setup() {
      return { args }
    },
    template: `
      <MyButton v-bind="args">
        <template #prefix>📁</template>
        <template #suffix>🔗</template>
      </MyButton>
    `
  })
}
```

## Advanced Usage Examples

### Custom Resolver Implementation

```typescript
// utils/component-resolvers.ts
import type { PropResolver, EventResolver, SlotResolver } from '@fastkit/vue-tiny-meta'

// Props resolution processing
export const propResolvers: PropResolver[] = [
  // Default value normalization
  (prop) => {
    if (prop.defaultValue) {
      // Remove unnecessary quotes
      prop.defaultValue.value = prop.defaultValue.value
        .replace(/^['"]|['"]$/g, '')
    }
    return prop
  },

  // Type information extension
  (prop) => {
    // Extract Union type values as array
    if (prop.type.name.includes('|')) {
      const values = prop.type.name
        .split('|')
        .map(v => v.trim().replace(/['"]/g, ''))
      prop.values = values
    }
    return prop
  },

  // Filter hidden properties
  (prop) => {
    if (prop.name.startsWith('_') || prop.name.startsWith('$')) {
      return false
    }
    return prop
  }
]

// Events resolution processing
export const eventResolvers: EventResolver[] = [
  // Event name normalization
  (event) => {
    // Convert onClick to click
    if (event.name.startsWith('on') && event.name.length > 2) {
      const simpleName = event.name.slice(2).toLowerCase()
      event.name = `on${event.name.slice(2)}` as `on${string}`
    }
    return event
  }
]

// Slots resolution processing
export const slotResolvers: SlotResolver[] = [
  // Slot name normalization
  (slot) => {
    // Remove v-slot: prefix for display
    if (slot.name.startsWith('v-slot:')) {
      const displayName = slot.name.replace('v-slot:', '')
      return {
        ...slot,
        name: slot.name,
        displayName
      } as any
    }
    return slot
  }
]
```

### Multiple File Analysis with Batch Processing

```typescript
// scripts/generate-docs.ts
import { glob } from 'glob'
import { extractAll } from '@fastkit/vue-tiny-meta'
import { writeFileSync } from 'fs'
import { propResolvers, eventResolvers, slotResolvers } from '../utils/component-resolvers'

interface ComponentDocumentation {
  [componentName: string]: any
}

async function generateComponentDocs() {
  const componentFiles = await glob('./src/components/**/*.{ts,tsx}')
  const documentation: ComponentDocumentation = {}

  for (const filePath of componentFiles) {
    try {
      console.log(`Processing: ${filePath}`)

      const metadata = extractAll(filePath, {
        // Custom filters
        ignoreProps: (baseRules) => [
          ...baseRules,
          'class',
          'style',
          /^data-/,
          /^aria-/
        ],

        ignoreEvents: (baseRules) => [
          ...baseRules,
          /^onVnode/
        ],

        ignoreSlots: ['v-slot:_'],

        // Custom resolvers
        resolvers: {
          prop: propResolvers,
          event: eventResolvers,
          slot: slotResolvers
        },

        // Sort settings
        sort: (a, b) => {
          const order = ['modelValue', 'onUpdate:modelValue', 'v-slot:default']
          const aIndex = order.indexOf(a.name)
          const bIndex = order.indexOf(b.name)

          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex
          }
          if (aIndex !== -1) return -1
          if (bIndex !== -1) return 1

          return a.name.localeCompare(b.name)
        }
      })

      metadata.forEach(component => {
        documentation[component.exportName] = component
      })

    } catch (error) {
      console.error(`Error processing ${filePath}:`, error)
    }
  }

  // Output as JSON file
  writeFileSync(
    './docs/components-meta.json',
    JSON.stringify(documentation, null, 2)
  )

  // Output as TypeScript definition file
  generateTypeDefinitions(documentation)

  console.log(`Generated documentation for ${Object.keys(documentation).length} components`)

  return documentation
}

function generateTypeDefinitions(documentation: ComponentDocumentation) {
  let content = `// Generated component type definitions\n\n`

  for (const [componentName, meta] of Object.entries(documentation)) {
    content += `export interface ${componentName}Props {\n`

    meta.props.forEach((prop: any) => {
      const optional = prop.required ? '' : '?'
      const description = prop.description ? ` /** ${prop.description} */\n  ` : '  '
      content += `${description}${prop.name}${optional}: ${prop.type.name}\n`
    })

    content += `}\n\n`

    content += `export interface ${componentName}Events {\n`
    meta.events.forEach((event: any) => {
      const description = event.description ? ` /** ${event.description} */\n  ` : '  '
      content += `${description}${event.name}: (${event.type.names.join(' | ')}) => void\n`
    })
    content += `}\n\n`
  }

  writeFileSync('./src/types/components.d.ts', content)
}

generateComponentDocs()
```

## API Specification

### `extractAll(filePath, options?)`

Function to extract Vue component metadata from a specified file.

```typescript
function extractAll(
  filePath: string,
  options?: SerializeVueOptions
): Promise<ComponentMeta[]>
```

**Parameters:**
- `filePath`: File path to analyze
- `options`: Analysis options

**Return Value:**
- `ComponentMeta[]`: Array of extracted component metadata

### `SerializeVueOptions`

Configuration options for metadata extraction.

```typescript
interface SerializeVueOptions {
  ignoreProps?: UserFilter              // Props to ignore
  ignoreEvents?: UserFilter             // Events to ignore
  ignoreSlots?: UserFilter              // Slots to ignore
  resolvers?: Resolvers | Resolvers[]   // Custom resolution processing
  sort?: SortOption                     // Sort configuration
}
```

### `ComponentMeta`

Type definition for extracted component metadata.

```typescript
interface ComponentMeta {
  displayName: string                   // Display name
  exportName: string                    // Export name
  description?: string                  // Description text
  props: PropMeta[]                     // Props information
  slots: SlotMeta[]                     // Slots information
  events: EventMeta[]                   // Events information
  docs: MetaDoc[]                       // JSDoc comments
  sourceFile: {                        // Source file information
    path: string
    line: number
  }
}
```

### Vite Plugin

```typescript
function ViteVueTinyMeta(
  options?: ViteVueTinyMetaOptions
): PluginOption
```

**Options:**
- `include`: Target file patterns
- `exclude`: Exclude file patterns
- `injectProperty`: Inject property name (default: `__docgenInfo`)

## Considerations

### TypeScript Configuration

- TypeScript strict mode is recommended
- `strict: true` setting is required
- Proper type annotations are important for accurate JSDoc comment extraction

### Performance Considerations

- Batch processing is recommended when analyzing large numbers of files at once
- During development hot reloads, analyze only changed files
- In production builds, exclude metadata as needed

### Limitations

- Only supports components defined with `defineComponent`
- Dynamically generated Props/Events are not subject to analysis
- Analysis may take time when file dependencies are complex

## License

MIT

## Related Packages

- [@fastkit/ts-tiny-meta](../ts-tiny-meta/README.md): TypeScript metadata extraction core functionality
- [@fastkit/helpers](../helpers/README.md): Basic utility functions
