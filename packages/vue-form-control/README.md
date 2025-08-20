
# @fastkit/vue-form-control

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-form-control/README-ja.md)

A fundamental form implementation library for Vue applications. Provides validation, masked input, selector functionality, and more.

## Features

- **Full Composition API Support**: Leverages the latest Vue 3 features
- **Type Safety**: Complete TypeScript support for type-safe form development
- **Validation Integration**: Comprehensive validation through @fastkit/rules integration
- **IMask Integration**: Advanced masked input functionality (imask library integration)
- **Selector Functionality**: Radio button, checkbox, and select box integration
- **Auto-sizing**: Dynamic textarea with VTextareaAutosize
- **Real-time Validation**: Real-time validation during input
- **Customizable**: Flexible control extension and customization

## Installation

```bash
npm install @fastkit/vue-form-control
# or
pnpm add @fastkit/vue-form-control
```

## Basic Usage

### Plugin Setup

```typescript
import { createApp } from 'vue';
import { installVueFormPlugin } from '@fastkit/vue-form-control';

const app = createApp(App);

// Install form plugin
installVueFormPlugin(app, {
  // Option settings
});
```

### Simple Form

```vue
<template>
  <form @submit="form.submit">
    <!-- Text input -->
    <input
      v-model="form.name.value"
      :class="{ error: form.name.invalid }"
      @blur="form.name.validate()"
    />
    <div v-if="form.name.invalid">{{ form.name.errorMessage }}</div>

    <!-- Number input -->
    <input
      type="number"
      v-model.number="form.age.value"
      :class="{ error: form.age.invalid }"
    />

    <!-- Select -->
    <select v-model="form.category.value">
      <option value="">Please select</option>
      <option value="a">Category A</option>
      <option value="b">Category B</option>
    </select>

    <button type="submit" :disabled="form.invalid">Submit</button>
  </form>
</template>

<script setup lang="ts">
import { useForm } from '@fastkit/vue-form-control';
import { required, minLength, between } from '@fastkit/rules';

// Form definition
const form = useForm({
  name: {
    value: '',
    rules: [required(), minLength(2)]
  },
  age: {
    value: 0,
    rules: [required(), between(0, 120)]
  },
  category: {
    value: '',
    rules: [required()]
  }
}, {
  onSubmit: async (values) => {
    console.log('Submit:', values);
    // API submission processing
    await api.submit(values);
  }
});
</script>
```

### Text Input Control

```vue
<template>
  <div>
    <!-- Basic text input -->
    <input
      v-model="textControl.value"
      @input="textControl.handleInput"
      @blur="textControl.handleBlur"
    />

    <!-- Masked input -->
    <input
      v-model="phoneControl.value"
      v-imask="phoneControl.maskOptions"
      @input="phoneControl.handleMaskInput"
    />

    <!-- Validation display -->
    <div v-if="textControl.invalid" class="error">
      {{ textControl.errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTextInputNodeControl } from '@fastkit/vue-form-control';
import { required, pattern } from '@fastkit/rules';

// Basic text input
const textControl = useTextInputNodeControl({
  value: '',
  rules: [required(), pattern(/^[a-zA-Z]+$/)]
});

// Phone number masked input
const phoneControl = useTextInputNodeControl({
  value: '',
  mask: '000-0000-0000',
  rules: [required()]
});
</script>
```

### Selector Control

```vue
<template>
  <div>
    <!-- Radio buttons -->
    <div v-for="item in radioItems" :key="item.value">
      <label>
        <input
          type="radio"
          :value="item.value"
          v-model="radioControl.value"
          @change="radioControl.handleChange"
        />
        {{ item.label }}
      </label>
    </div>

    <!-- Checkboxes (multiple selection) -->
    <div v-for="item in checkboxItems" :key="item.value">
      <label>
        <input
          type="checkbox"
          :value="item.value"
          v-model="checkboxControl.value"
          @change="checkboxControl.handleChange"
        />
        {{ item.label }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormSelectorControl } from '@fastkit/vue-form-control';
import { required } from '@fastkit/rules';

// Radio button control
const radioControl = useFormSelectorControl({
  value: '',
  items: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ],
  rules: [required()]
});

// Checkbox control (multiple selection)
const checkboxControl = useFormSelectorControl({
  value: [] as string[],
  multiple: true,
  items: [
    { value: 'item1', label: 'Item 1' },
    { value: 'item2', label: 'Item 2' },
    { value: 'item3', label: 'Item 3' }
  ]
});
</script>
```

### VTextareaAutosize Component

A textarea component with auto-sizing functionality. The height dynamically adjusts based on the content.

```vue
<template>
  <div>
    <!-- Basic auto-sizing textarea -->
    <VTextareaAutosize
      v-model="content"
      placeholder="Please enter your message..."
      :min-rows="3"
      :max-rows="10"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- Example with properties -->
    <VTextareaAutosize
      v-model="comment"
      name="comment"
      autocomplete="off"
      :maxlength="500"
      :readonly="isReadonly"
      :disabled="isDisabled"
      placeholder="Enter comment..."
      :min-rows="2"
      :max-rows="8"
      class="custom-textarea"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VTextareaAutosize } from '@fastkit/vue-form-control';

const content = ref('');
const comment = ref('');
const isReadonly = ref(false);
const isDisabled = ref(false);

const handleInput = (event: Event) => {
  console.log('Input received:', (event.target as HTMLTextAreaElement).value);
};

const handleFocus = (event: FocusEvent) => {
  console.log('Focused');
};

const handleBlur = (event: FocusEvent) => {
  console.log('Focus lost');
};
</script>

<style scoped>
.custom-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.2s ease;
}

.custom-textarea:focus {
  border-color: #007bff;
  outline: none;
}
</style>
```

#### Advanced Usage Examples for VTextareaAutosize

```vue
<template>
  <div>
    <!-- Chat message input -->
    <div class="chat-input-container">
      <VTextareaAutosize
        ref="chatInput"
        v-model="message"
        placeholder="Enter message... (Shift+Enter for new line, Enter to send)"
        :min-rows="1"
        :max-rows="5"
        class="chat-input"
        @keydown="handleKeydown"
        @input="handleInput"
      />
      <button
        :disabled="!message.trim()"
        @click="sendMessage"
        class="send-button"
      >
        Send
      </button>
    </div>

    <!-- Dynamic form field -->
    <div class="form-field">
      <label for="description">Description</label>
      <VTextareaAutosize
        id="description"
        v-model="description"
        :min-rows="2"
        :max-rows="15"
        :maxlength="1000"
        placeholder="Please enter detailed product description..."
        class="description-input"
      />
      <div class="char-count">
        {{ description.length }}/1000 characters
      </div>
    </div>

    <!-- JSON editor style -->
    <div class="json-editor">
      <label>JSON Settings</label>
      <VTextareaAutosize
        v-model="jsonConfig"
        :min-rows="5"
        :max-rows="20"
        placeholder="Enter settings in JSON format..."
        class="json-input"
        autocomplete="off"
        spellcheck="false"
      />
      <div v-if="jsonError" class="error">
        {{ jsonError }}
      </div>
      <div v-else class="success">
        ✓ Valid JSON format
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VTextareaAutosize, type VTextareaAutosizeRef } from '@fastkit/vue-form-control';

const chatInput = ref<VTextareaAutosizeRef>();
const message = ref('');
const description = ref('');
const jsonConfig = ref('{\n  "theme": "dark",\n  "autoSave": true\n}');

// JSON validation
const jsonError = computed(() => {
  if (!jsonConfig.value.trim()) return null;

  try {
    JSON.parse(jsonConfig.value);
    return null;
  } catch (error) {
    return `JSON syntax error: ${(error as Error).message}`;
  }
});

// Chat input keyboard handling
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

const handleInput = (event: Event) => {
  // Processing during input (e.g., updating typing indicator)
  console.log('Typing...');
};

const sendMessage = () => {
  if (!message.value.trim()) return;

  // Message sending process
  console.log('Send message:', message.value);

  // Clear input field
  message.value = '';

  // Return focus
  chatInput.value?.focus();
};

// Auto-format JSON settings (optional)
const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonConfig.value);
    jsonConfig.value = JSON.stringify(parsed, null, 2);
  } catch (error) {
    // Do nothing on error
  }
};

// Monitor description character count
watch(description, (newValue) => {
  if (newValue.length > 1000) {
    description.value = newValue.substring(0, 1000);
  }
});
</script>

<style scoped>
.chat-input-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
}

.send-button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.send-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.description-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.json-editor {
  margin-top: 24px;
}

.json-editor label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.json-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  resize: none;
  background: #f8f9fa;
}

.error {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.success {
  color: #28a745;
  font-size: 12px;
  margin-top: 4px;
}
</style>
```

## Advanced Usage Examples

### Custom Validation

```typescript
import { useTextInputNodeControl } from '@fastkit/vue-form-control';
import { required } from '@fastkit/rules';

// Custom validation function
const uniqueEmail = (value: string) => {
  return new Promise((resolve) => {
    // Check email uniqueness via API call
    api.checkEmailUnique(value).then(isUnique => {
      resolve(isUnique ? true : 'This email address is already in use');
    });
  });
};

const emailControl = useTextInputNodeControl({
  value: '',
  rules: [
    required(),
    uniqueEmail  // Asynchronous validation
  ],
  validateTiming: ['blur', 'change']  // Validation timing
});
```

### Masked Input with IMask

```typescript
import { useTextInputNodeControl } from '@fastkit/vue-form-control';
import IMask from 'imask';

// Date mask
const dateControl = useTextInputNodeControl({
  value: '',
  mask: {
    mask: Date,
    pattern: 'YYYY-MM-DD',
    format: (date: Date) => date.toISOString().slice(0, 10),
    parse: (str: string) => new Date(str)
  }
});

// Currency mask
const currencyControl = useTextInputNodeControl({
  value: '',
  mask: {
    mask: Number,
    scale: 2,
    signed: false,
    thousandsSeparator: ',',
    padFractionalZeros: true,
    radix: '.'
  }
});

// Postal code mask
const zipControl = useTextInputNodeControl({
  value: '',
  mask: '000-0000'
});
```

### Form Groups

```vue
<script setup lang="ts">
import { useFormGroup } from '@fastkit/vue-form-control';
import { required, email } from '@fastkit/rules';

// Nested form structure
const userForm = useFormGroup({
  personal: useFormGroup({
    firstName: useTextInputNodeControl({
      value: '',
      rules: [required()]
    }),
    lastName: useTextInputNodeControl({
      value: '',
      rules: [required()]
    }),
    email: useTextInputNodeControl({
      value: '',
      rules: [required(), email()]
    })
  }),

  preferences: useFormGroup({
    newsletter: useFormSelectorControl({
      value: false,
      items: [
        { value: true, label: 'Subscribe' },
        { value: false, label: 'Do not subscribe' }
      ]
    }),
    categories: useFormSelectorControl({
      value: [] as string[],
      multiple: true,
      items: [
        { value: 'tech', label: 'Technology' },
        { value: 'business', label: 'Business' },
        { value: 'lifestyle', label: 'Lifestyle' }
      ]
    })
  })
});

// Get entire form values
const formValues = computed(() => userForm.value);

// Validate entire form
const isFormValid = computed(() => userForm.valid);
</script>
```

## API

### useForm

Composable for managing the entire form.

```typescript
const form = useForm(fields, options);
```

**Parameters:**
- `fields`: Field definition object
- `options`: Form options

**Return Value:**
- Form control instance

### useTextInputNodeControl

Composable for text input control.

```typescript
const control = useTextInputNodeControl({
  value: string,
  rules?: ValidationRule[],
  mask?: IMaskOptions,
  finalizers?: TextFinalizer[],
  validateTiming?: ValidateTiming[]
});
```

### useFormSelectorControl

Composable for selector control.

```typescript
const control = useFormSelectorControl({
  value: any,
  items: SelectorItem[],
  multiple?: boolean,
  rules?: ValidationRule[]
});
```

### useFormGroup

Composable for form group control.

```typescript
const group = useFormGroup(controls);
```

### VTextareaAutosize

Textarea component with auto-sizing functionality.

```typescript
interface VTextareaAutosizeRef {
  value: string;
  focus(opts?: FocusOptions): void;
  blur(): void;
}

// Properties
interface VTextareaAutosizeProps {
  modelValue?: string;           // v-model value
  minRows?: number | string;     // Minimum rows (default: 1)
  maxRows?: number | string;     // Maximum rows
  autocomplete?: string;         // Autocomplete
  autofocus?: boolean;           // Auto focus
  disabled?: boolean;            // Disabled state
  readonly?: boolean;            // Read-only
  required?: boolean;            // Required field
  name?: string;                 // Field name
  placeholder?: string;          // Placeholder
  maxlength?: number | string;   // Maximum character count
  minlength?: number | string;   // Minimum character count
  form?: string;                 // Associated form ID
}

// Events
interface VTextareaAutosizeEmits {
  'update:modelValue': (value: string) => void;  // v-model update
  input: (event: Event) => void;                 // Input event
  focus: (event: FocusEvent) => void;            // Focus event
  blur: (event: FocusEvent) => void;             // Blur event
}
```

**Features:**
- Automatic height adjustment based on content
- Minimum and maximum row limits
- Responsive support with ResizeObserver
- High performance with debounce processing
- Infinite rendering prevention
- Standard HTML textarea attribute support

## Validation

### Basic Rules (@fastkit/rules integration)

```typescript
import {
  required,
  email,
  minLength,
  maxLength,
  pattern,
  between
} from '@fastkit/rules';

const control = useTextInputNodeControl({
  value: '',
  rules: [
    required(),
    email(),
    minLength(5),
    maxLength(100),
    pattern(/^[a-zA-Z0-9]+$/),
    between(1, 999)
  ]
});
```

### Custom Rules

```typescript
const customRule = (value: any) => {
  if (value !== 'expected') {
    return 'Not the expected value';
  }
  return true;
};

const control = useTextInputNodeControl({
  value: '',
  rules: [required(), customRule]
});
```

## IMask Integration

### Basic Masks

```typescript
// Phone number
mask: '000-0000-0000'

// Postal code
mask: '000-0000'

// Credit card
mask: '0000 0000 0000 0000'
```

### Advanced Masks

```typescript
// Date
mask: {
  mask: Date,
  pattern: 'YYYY-MM-DD',
  blocks: {
    YYYY: { mask: '0000' },
    MM: { mask: '00' },
    DD: { mask: '00' }
  }
}

// Number
mask: {
  mask: Number,
  scale: 2,
  thousandsSeparator: ',',
  padFractionalZeros: true
}
```

## Text Finalizers

```typescript
import {
  useTextInputNodeControl,
  BUILTIN_TEXT_FINALIZERS
} from '@fastkit/vue-form-control';

const control = useTextInputNodeControl({
  value: '',
  finalizers: [
    BUILTIN_TEXT_FINALIZERS.trim,      // Remove leading/trailing whitespace
    BUILTIN_TEXT_FINALIZERS.upper,     // Convert to uppercase
    BUILTIN_TEXT_FINALIZERS.removeSpace, // Remove all whitespace
    // Custom finalizer
    (value) => value.replace(/[^\w]/g, '')
  ]
});
```

## Dependencies

- `vue`: ^3.4.0 (Peer Dependency)
- `@fastkit/rules`: Validation rules
- `@fastkit/helpers`: Helper utilities
- `@fastkit/vue-utils`: Vue utilities
- `imask`: Masked input library

## Documentation

For detailed documentation, please see [here](https://dadajam4.github.io/fastkit/vue-form-control/).

## License

MIT
