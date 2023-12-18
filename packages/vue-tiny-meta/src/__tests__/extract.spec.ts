import { describe, it, expect } from 'vitest';
import { extractAll } from '../';
import path from 'node:path';

describe('extract', () => {
  it('BasicSpec', () => {
    const filePath = path.resolve(__dirname, 'components/BasicSpec.tsx');
    const extracted = extractAll(filePath)[0];

    expect(extracted.displayName).toBe('BasicSpec');
    expect(extracted.exportName).toBe('BasicSpec');
    expect(extracted.description).toBe('Component comment');

    const prop1 = extracted.props[0];
    expect(prop1.name).toBe('msg');
    expect(prop1.description).toBe('prop comment');
    expect(prop1.type.name).toBe('string');
    expect(prop1.required).toBe(false);
    expect(prop1.defaultValue).toBe(undefined);
    expect(prop1.values).toBe(undefined);
    expect(prop1.docs[0].description.text).toBe('prop comment');

    const ev1 = extracted.events[0];
    expect(ev1.name).toBe('onClick');
    expect(ev1.description).toBe(undefined);
    expect(ev1.type.name).toBe('(ev: MouseEvent) => any');

    const slot1 = extracted.slots[0];
    expect(slot1.name).toBe('v-slot:customSlot');
    expect(slot1.description).toBe('slot comment');
    expect(slot1.type.name).toBe('(props: { message: string; }) => any');
  });

  it('FactorySpec', () => {
    const filePath = path.resolve(__dirname, 'components/FactorySpec.tsx');
    const extracted = extractAll(filePath)[0];

    expect(extracted.displayName).toBe('FactorySpec');
    expect(extracted.exportName).toBe('FactorySpec');
    expect(extracted.description).toBe('Component comment');

    const prop1 = extracted.props[0];
    expect(prop1.name).toBe('msg');
    expect(prop1.description).toBe('prop comment');
    expect(prop1.type.name).toBe('string');
    expect(prop1.required).toBe(false);
    expect(prop1.defaultValue).toBe(undefined);
    expect(prop1.values).toBe(undefined);
    expect(prop1.docs[0].description.text).toBe('prop comment');

    const ev1 = extracted.events[0];
    expect(ev1.name).toBe('onClick');
    expect(ev1.description).toBe(undefined);
    expect(ev1.type.name).toBe('(ev: MouseEvent) => any');

    const slot1 = extracted.slots[0];
    expect(slot1.name).toBe('v-slot:customSlot');
    expect(slot1.description).toBe('slot comment');
    expect(slot1.type.name).toBe('(props: { message: string; }) => any');
  });

  it('AssignmentSpec', () => {
    const filePath = path.resolve(__dirname, 'components/AssignmentSpec.tsx');
    const extracted = extractAll(filePath)[0];

    expect(extracted.displayName).toBe('AssignmentSpec');
    expect(extracted.exportName).toBe('AssignmentSpec');
    expect(extracted.description).toBe('Component comment');

    const prop1 = extracted.props[0];
    expect(prop1.name).toBe('msg');
    expect(prop1.description).toBe('prop comment');
    expect(prop1.type.name).toBe('string');
    expect(prop1.required).toBe(false);
    expect(prop1.defaultValue).toBe(undefined);
    expect(prop1.values).toBe(undefined);
    expect(prop1.docs[0].description.text).toBe('prop comment');

    const ev1 = extracted.events[0];
    expect(ev1.name).toBe('onClick');
    expect(ev1.description).toBe(undefined);
    expect(ev1.type.name).toBe('(ev: MouseEvent) => any');

    const slot1 = extracted.slots[0];
    expect(slot1.name).toBe('v-slot:customSlot');
    expect(slot1.description).toBe('slot comment');
    expect(slot1.type.name).toBe('(props: { message: string; }) => any');
  });

  it('FunctionalSpec', () => {
    const filePath = path.resolve(__dirname, 'components/FunctionalSpec.tsx');
    const extracted = extractAll(filePath)[0];

    expect(extracted.displayName).toBe('FunctionalSpec');
    expect(extracted.exportName).toBe('FunctionalSpec');
    expect(extracted.description).toBe('Component comment');

    const prop1 = extracted.props[0];
    expect(prop1.name).toBe('fuga');
    expect(prop1.description).toBe('prop comment');
    expect(prop1.type.name).toBe('boolean');
    expect(prop1.required).toBe(false);
    expect(prop1.defaultValue).toBe(undefined);
    expect(prop1.values).toBe(undefined);
    expect(prop1.docs[0].description.text).toBe('prop comment');

    const ev1 = extracted.events[0];
    expect(ev1.name).toBe('onClick');
    expect(ev1.description).toBe(undefined);
    expect(ev1.type.name).toBe('(...args: any[]) => any');
  });
});
