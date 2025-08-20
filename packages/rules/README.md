
# @fastkit/rules

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/rules/README-ja.md)

A universal validation library that works on both server and browser. Built with TypeScript, providing a validation system that emphasizes type safety and flexibility.

## Features

- **Universal Support**: Common code for server-side and client-side
- **Full TypeScript Support**: Strict type safety and IntelliSense support
- **Async Validation**: Promise-based asynchronous processing support
- **Nested Validation**: Validation of deep object structures
- **Custom Rules**: Flexible custom validation rule creation
- **Vue.js Integration**: Seamless integration with @fastkit/vue-form-control
- **Rich Built-in Rules**: 30+ practical validation rules
- **Detailed Error Information**: Structured error reporting
- **Internationalization Support**: Multi-language error message support
- **Lightweight Design**: Minimal dependencies

## Installation

```bash
npm install @fastkit/rules
# or
pnpm add @fastkit/rules
```

## Basic Usage

### Simple Validation

```typescript
import { validate, required, email, maxLength } from '@fastkit/rules';

// Single rule validation
const result1 = await validate('', required);
console.log(result1); // ValidationError object

const result2 = await validate('test@example.com', email);
console.log(result2); // null (success)

// Multiple rules validation
const result3 = await validate('user@example.com', [
  required,
  email,
  maxLength(50)
]);
console.log(result3); // null (all success) or ValidationError
```

### Vue.js Form Integration

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <VTextField
      v-model="form.email.value"
      label="Email Address"
      :rules="[required, email]"
      :invalid="form.email.invalid"
      :error-message="form.email.errorMessage"
    />

    <VTextField
      v-model="form.password.value"
      label="Password"
      type="password"
      :rules="[required, minLength(8)]"
      :invalid="form.password.invalid"
      :error-message="form.password.errorMessage"
    />

    <VButton
      type="submit"
      :disabled="form.invalid"
      color="primary"
    >
      Login
    </VButton>
  </form>
</template>

<script setup lang="ts">
import { useForm } from '@fastkit/vue-form-control';
import { required, email, minLength } from '@fastkit/rules';

const form = useForm({
  email: {
    value: '',
    rules: [required, email]
  },
  password: {
    value: '',
    rules: [required, minLength(8)]
  }
}, {
  onSubmit: async (values) => {
    console.log('Submit data:', values);
    // API call processing
  }
});
</script>
```

## Built-in Validation Rules

### Basic Rules

#### required - Required Check

```typescript
import { required } from '@fastkit/rules';

// Non-empty value required
await validate('', required); // Error
await validate('text', required); // OK
await validate(0, required); // OK
await validate(false, required); // OK
await validate([], required); // Error (empty array)
await validate([1], required); // OK
```

#### email - Email Format Check

```typescript
import { email } from '@fastkit/rules';

await validate('user@example.com', email); // OK
await validate('invalid-email', email); // Error

// Multiple email support
await validate('user1@example.com,user2@example.com', email); // OK
```

#### pattern - Regular Expression Check

```typescript
import { pattern } from '@fastkit/rules';

const phoneRule = pattern(/^\d{3}-\d{4}-\d{4}$/);
await validate('090-1234-5678', phoneRule); // OK
await validate('invalid-phone', phoneRule); // Error

// With custom message
const customPattern = pattern({
  pattern: /^[A-Z]+$/,
  message: 'Only uppercase letters are allowed'
});
```

### String & Number Rules

#### length - Length Check

```typescript
import { length, minLength, maxLength } from '@fastkit/rules';

// Exact length
await validate('hello', length(5)); // OK
await validate('hello', length(3)); // Error

// Minimum length
await validate('abc', minLength(2)); // OK
await validate('a', minLength(2)); // Error

// Maximum length
await validate('hello', maxLength(10)); // OK
await validate('very long text here', maxLength(10)); // Error

// Range specification
await validate('test', length({ min: 2, max: 6 })); // OK
```

#### numeric - Number Check

```typescript
import { numeric, between, greaterThan, lessThan } from '@fastkit/rules';

// Number format check
await validate('123', numeric); // OK
await validate('123.45', numeric); // OK
await validate('abc', numeric); // Error

// Range check
await validate(25, between({ min: 18, max: 65 })); // OK
await validate(10, between({ min: 18, max: 65 })); // Error

// Comparison
await validate(10, greaterThan(5)); // OK
await validate(3, greaterThan(5)); // Error
await validate(3, lessThan(5)); // OK
```

### Special Format Checks

#### url - URL Format Check

```typescript
import { url } from '@fastkit/rules';

await validate('https://example.com', url); // OK
await validate('http://localhost:3000', url); // OK
await validate('invalid-url', url); // Error
```

#### date - Date Check

```typescript
import { date } from '@fastkit/rules';

await validate('2023-12-25', date); // OK
await validate('2023/12/25', date); // OK
await validate(new Date(), date); // OK
await validate('invalid-date', date); // Error
```

#### alphaSpaces - Alphabetic + Spaces Check

```typescript
import { alphaSpaces } from '@fastkit/rules';

await validate('John Doe', alphaSpaces); // OK
await validate('John123', alphaSpaces); // Error
```

#### kana - Kana Character Check

```typescript
import { kana } from '@fastkit/rules';

await validate('タナカタロウ', kana); // OK (Katakana)
await validate('tanakatarou', kana); // OK (Hiragana)
await validate('田中太郎', kana); // Error (Kanji)
```

## Nested Validation

### Array Validation

```typescript
import { each, required, maxLength } from '@fastkit/rules';

// Validate each element in array
const arrayRule = each({
  rules: [required, maxLength(10)],
  skipIfEmpty: true // Skip empty arrays
});

await validate(['hello', 'world'], arrayRule); // OK
await validate(['hello', ''], arrayRule); // Error (empty element)
await validate(['hello', 'very long text'], arrayRule); // Error (too long)

// Get indexed error information
const result = await validate(['', 'valid'], arrayRule);
if (result) {
  console.log(result.children[0].path); // 0 (error index)
}
```

### Object Validation

```typescript
import { fields, required, email, minLength } from '@fastkit/rules';

interface User {
  name: string;
  email: string;
  profile: {
    bio: string;
    age: number;
  };
}

// Object field validation
const userRule = fields<User>({
  rules: {
    name: [required, maxLength(50)],
    email: [required, email],
    profile: fields({
      rules: {
        bio: maxLength(200),
        age: [required, between({ min: 0, max: 120 })]
      }
    })
  }
});

const userData = {
  name: 'Taro Tanaka',
  email: 'tanaka@example.com',
  profile: {
    bio: 'I am an engineer',
    age: 30
  }
};

const result = await validate(userData, userRule);
// result is null (success) or nested error information
```

## Custom Validation Rules

### Basic Custom Rule Creation

```typescript
import { createRule } from '@fastkit/rules';

// Simple custom rule
const evenNumber = createRule({
  name: 'evenNumber',
  validate: (value) => {
    const num = Number(value);
    return !isNaN(num) && num % 2 === 0;
  },
  message: 'Please enter an even number'
});

await validate(4, evenNumber); // OK
await validate(3, evenNumber); // Error

// Dynamic message
const minimumAge = createRule<{ age: number }>({
  name: 'minimumAge',
  validate: (value, constraints) => {
    const age = Number(value);
    return age >= constraints.age;
  },
  message: (value, { constraints }) =>
    `Must be ${constraints.age} years or older`,
  constraints: { age: 18 }
});

// Use with customized constraints
const adultAge = minimumAge.fork({ constraints: { age: 20 } });
```

### Async Validation

```typescript
// Validation using async API
const uniqueEmail = createRule({
  name: 'uniqueEmail',
  validate: async (value) => {
    if (!value) return true; // Leave empty values to other rules

    try {
      const response = await fetch(`/api/check-email?email=${value}`);
      const data = await response.json();
      return data.isUnique;
    } catch (error) {
      // Consider network errors as success
      return true;
    }
  },
  message: 'This email address is already in use'
});

// Usage example
const emailRules = [required, email, uniqueEmail];
await validate('user@example.com', emailRules);
```

### Function-style Rules

```typescript
// Simple function-style rule
const notEmpty = (value: any) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return 'Cannot be empty';
  }
  return true;
};

// Conditional rule
const conditionalRequired = (value: any, _constraints: any, context: any) => {
  // Can reference values from other fields via context
  if (context.type === 'business' && !value) {
    return 'Required for business accounts';
  }
  return true;
};
```

## Advanced Usage Examples

### Whole Form Validation

```typescript
import { validate, fields, required, email, minLength, pattern } from '@fastkit/rules';

interface RegistrationForm {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
  };
  account: {
    username: string;
    password: string;
    confirmPassword: string;
  };
  terms: boolean;
}

// Password confirmation rule
const confirmPassword = createRule({
  name: 'confirmPassword',
  validate: (value, _constraints, context) => {
    return value === context.account.password;
  },
  message: 'Passwords do not match'
});

// Whole form rule definition
const registrationRule = fields<RegistrationForm>({
  rules: {
    personal: fields({
      rules: {
        firstName: [required, maxLength(50)],
        lastName: [required, maxLength(50)],
        email: [required, email]
      }
    }),
    account: fields({
      rules: {
        username: [
          required,
          minLength(3),
          maxLength(20),
          pattern(/^[a-zA-Z0-9_]+$/)
        ],
        password: [required, minLength(8)],
        confirmPassword: [required, confirmPassword]
      }
    }),
    terms: (value) => value === true ? true : 'Please agree to the terms of service'
  }
});

// Execute validation
const formData: RegistrationForm = {
  personal: {
    firstName: 'Taro',
    lastName: 'Tanaka',
    email: 'taro@example.com'
  },
  account: {
    username: 'taro123',
    password: 'password123',
    confirmPassword: 'password123'
  },
  terms: true
};

const errors = await validate(formData, registrationRule);
if (errors) {
  // Get errors in hierarchical structure
  console.log('Personal info errors:', errors.children?.personal);
  console.log('Account info errors:', errors.children?.account);
}
```

### Conditional Validation

```typescript
import { validateIf, required, pattern } from '@fastkit/rules';

// Execute validation based on conditions
const businessPhoneRule = validateIf(
  (value, _constraints, context) => context.accountType === 'business',
  [required, pattern(/^\d{2,4}-\d{2,4}-\d{4}$/)]
);

const formRule = fields({
  rules: {
    accountType: required,
    businessPhone: businessPhoneRule, // Required only for business accounts
    personalEmail: validateIf(
      (value, _constraints, context) => context.accountType === 'personal',
      [required, email]
    )
  }
});
```

### Batch Validation

```typescript
// Validate multiple values in batch
const batchValidate = async (data: Record<string, any>, rules: Record<string, any[]>) => {
  const results: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (rules[key]) {
      results[key] = await validate(value, rules[key]);
    }
  }

  return results;
};

// Usage example
const userData = {
  name: 'Taro Tanaka',
  email: 'invalid-email',
  age: 25
};

const userRules = {
  name: [required, maxLength(50)],
  email: [required, email],
  age: [required, between({ min: 0, max: 120 })]
};

const results = await batchValidate(userData, userRules);
console.log(results);
// {
//   name: null,           // Success
//   email: ValidationError,  // Error
//   age: null            // Success
// }
```

### Custom Error Message Provider

```typescript
// Internationalization-ready message provider
const createI18nRule = (baseRule: any, messages: Record<string, string>) => {
  return baseRule.fork({
    message: (value: any, { constraints }: any, context: any) => {
      const locale = context.locale || 'en';
      return messages[locale] || messages['en'];
    }
  });
};

// Multi-language rules
const requiredI18n = createI18nRule(required, {
  'en': 'This field is required',
  'ja': 'This field is required',
  'ko': '이 필드는 필수입니다'
});

const emailI18n = createI18nRule(email, {
  'en': 'Please enter a valid email address',
  'ja': 'Please enter a valid email address',
  'ko': '유효한 이메일 주소를 입력하세요'
});
```

## Practical Vue.js Usage Examples

### Real-time Validation

```vue
<template>
  <div class="registration-form">
    <h2>User Registration</h2>

    <!-- Basic Information -->
    <fieldset>
      <legend>Basic Information</legend>

      <VTextField
        v-model="form.firstName.value"
        label="First Name"
        :rules="nameRules"
        :invalid="form.firstName.invalid"
        :error-message="form.firstName.errorMessage"
        validate-on="blur"
      />

      <VTextField
        v-model="form.lastName.value"
        label="Last Name"
        :rules="nameRules"
        :invalid="form.lastName.invalid"
        :error-message="form.lastName.errorMessage"
        validate-on="blur"
      />

      <VTextField
        v-model="form.email.value"
        label="Email Address"
        type="email"
        :rules="emailRules"
        :invalid="form.email.invalid"
        :error-message="form.email.errorMessage"
        validate-on="change"
        :loading="form.email.validating"
      />
    </fieldset>

    <!-- Account Information -->
    <fieldset>
      <legend>Account Information</legend>

      <VTextField
        v-model="form.username.value"
        label="Username"
        :rules="usernameRules"
        :invalid="form.username.invalid"
        :error-message="form.username.errorMessage"
        hint="3-20 characters, alphanumeric and underscore"
      />

      <VTextField
        v-model="form.password.value"
        label="Password"
        type="password"
        :rules="passwordRules"
        :invalid="form.password.invalid"
        :error-message="form.password.errorMessage"
        hint="8 characters or more"
      />

      <VTextField
        v-model="form.confirmPassword.value"
        label="Confirm Password"
        type="password"
        :rules="confirmPasswordRules"
        :invalid="form.confirmPassword.invalid"
        :error-message="form.confirmPassword.errorMessage"
      />
    </fieldset>

    <!-- Terms of Service -->
    <VCheckbox
      v-model="form.terms.value"
      :rules="[required]"
      :invalid="form.terms.invalid"
    >
      I agree to the <a href="/terms" target="_blank">Terms of Service</a>
    </VCheckbox>

    <!-- Submit Button -->
    <VButton
      type="submit"
      color="primary"
      size="lg"
      :disabled="form.invalid || submitting"
      :loading="submitting"
      @click="handleSubmit"
    >
      Register
    </VButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useForm } from '@fastkit/vue-form-control';
import {
  required, email, minLength, maxLength, pattern,
  createRule
} from '@fastkit/rules';

const submitting = ref(false);

// Custom validation rules
const uniqueEmail = createRule({
  name: 'uniqueEmail',
  validate: async (value) => {
    if (!value) return true;
    const response = await fetch(`/api/check-email?email=${value}`);
    const data = await response.json();
    return data.isUnique;
  },
  message: 'This email address is already in use'
});

const uniqueUsername = createRule({
  name: 'uniqueUsername',
  validate: async (value) => {
    if (!value) return true;
    const response = await fetch(`/api/check-username?username=${value}`);
    const data = await response.json();
    return data.isUnique;
  },
  message: 'This username is already in use'
});

// Validation rule definitions
const nameRules = [required, maxLength(50)];
const emailRules = [required, email, uniqueEmail];
const usernameRules = [
  required,
  minLength(3),
  maxLength(20),
  pattern(/^[a-zA-Z0-9_]+$/),
  uniqueUsername
];
const passwordRules = [required, minLength(8)];

// Form definition
const form = useForm({
  firstName: { value: '', rules: nameRules },
  lastName: { value: '', rules: nameRules },
  email: { value: '', rules: emailRules },
  username: { value: '', rules: usernameRules },
  password: { value: '', rules: passwordRules },
  confirmPassword: {
    value: '',
    rules: [
      required,
      (value) => {
        if (value !== form.password.value) {
          return 'Passwords do not match';
        }
        return true;
      }
    ]
  },
  terms: { value: false, rules: [required] }
}, {
  onSubmit: async (values) => {
    submitting.value = true;
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        // Registration success
        alert('Registration completed successfully');
      } else {
        // Server error
        alert('Registration failed');
      }
    } finally {
      submitting.value = false;
    }
  }
});

// Dynamically update password confirmation rule
const confirmPasswordRules = computed(() => [
  required,
  (value: string) => {
    if (value !== form.password.value) {
      return 'Passwords do not match';
    }
    return true;
  }
]);

const handleSubmit = () => {
  form.submit();
};
</script>

<style scoped>
.registration-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

legend {
  font-weight: bold;
  padding: 0 0.5rem;
}
</style>
```

## Error Handling

### ValidationError Structure

```typescript
interface ValidationError {
  $$symbol: 'ValidationError';
  name: string;           // Rule name
  message: string;        // Error message
  value?: any;           // Failed validation value
  path?: string | number; // Field path
  fullPath?: string;     // Full path (including nested)
  children?: ValidationError[]; // Child element errors
  constraints?: any;     // Rule constraints
}

// Error information usage example
const errors = await validate(formData, formRules);
if (errors) {
  // Field-specific error handling
  if (errors.children?.email) {
    console.log('Email error:', errors.children.email.message);
  }

  // Get all error messages
  const allErrors = collectAllErrors(errors);
  allErrors.forEach(error => {
    console.log(`${error.fullPath}: ${error.message}`);
  });
}

// Error collection helper function
function collectAllErrors(error: ValidationError): ValidationError[] {
  const errors = [error];
  if (error.children) {
    Object.values(error.children).forEach(childError => {
      if (childError) {
        errors.push(...collectAllErrors(childError));
      }
    });
  }
  return errors;
}
```

## Performance Optimization

### Validation Strategy

```typescript
// Early termination strategy (stop at first error)
const result1 = await validate(value, rules); // Default

// All rules execution strategy (collect all errors)
const result2 = await validate(value, rules, { forceAll: true });

// Parallel execution of async rules
const asyncRules = [asyncRule1, asyncRule2, asyncRule3];
const result3 = await validate(value, asyncRules, {
  parallel: true  // Parallel execution for performance improvement
});
```

### Validation Cache

```typescript
// Cache results to avoid duplicate checks
const memoizedValidate = (() => {
  const cache = new Map();

  return async (value: any, rules: any[]) => {
    const key = JSON.stringify({ value, rules: rules.map(r => r.name) });

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = await validate(value, rules);
    cache.set(key, result);

    // Cache size limit
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
})();
```

## Test Patterns

### Unit Test Examples

```typescript
import { describe, test, expect } from 'vitest';
import { validate, required, email, minLength } from '@fastkit/rules';

describe('Validation Rules', () => {
  describe('required', () => {
    test('error on empty value', async () => {
      const result = await validate('', required);
      expect(result).toBeTruthy();
      expect(result?.name).toBe('required');
    });

    test('success when value exists', async () => {
      const result = await validate('test', required);
      expect(result).toBeNull();
    });
  });

  describe('email', () => {
    test('success with valid email', async () => {
      const result = await validate('user@example.com', email);
      expect(result).toBeNull();
    });

    test('error with invalid email', async () => {
      const result = await validate('invalid-email', email);
      expect(result).toBeTruthy();
      expect(result?.name).toBe('email');
    });
  });

  describe('compound rules', () => {
    test('all rules succeed', async () => {
      const result = await validate('user@example.com', [
        required,
        email,
        minLength(5)
      ]);
      expect(result).toBeNull();
    });

    test('error on any rule failure', async () => {
      const result = await validate('a@b.c', [
        required,
        email,
        minLength(10)
      ]);
      expect(result).toBeTruthy();
      expect(result?.name).toBe('minLength');
    });
  });
});
```

## Dependencies

```json
{
  "dependencies": {
    "@fastkit/helpers": "utility functions"
  },
  "peerDependencies": {},
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^1.0.0"
  }
}
```

## Documentation

For detailed documentation, please visit [here](https://dadajam4.github.io/fastkit/rules/).

## License

MIT
