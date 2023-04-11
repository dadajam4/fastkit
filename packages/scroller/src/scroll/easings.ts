const easings = {
  ease: [0.25, 0.1, 0.25, 1.0] as EasingValues,
  linear: [0.0, 0.0, 1.0, 1.0] as EasingValues,
  'ease-in': [0.42, 0.0, 1.0, 1.0] as EasingValues,
  'ease-out': [0.0, 0.0, 0.58, 1.0] as EasingValues,
  'ease-in-out': [0.42, 0.0, 0.58, 1.0] as EasingValues,
};
export type EasingName = keyof typeof easings;
export type EasingValues = [number, number, number, number];
export default easings;
