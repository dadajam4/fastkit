# @fastkit/vue-form-control

## 0.20.29

### Patch Changes

- [#151](https://github.com/dadajam4/fastkit/pull/151) [`515ad05`](https://github.com/dadajam4/fastkit/commit/515ad05b1f541e372815d63ddad46fe1e113df49) Thanks [@nkenji09](https://github.com/nkenji09)! - Fix preserveOrder behavior in FormSelectorControl

  The preserveOrder property behavior was inverted from the intended specification:

  - `preserveOrder: false` (default) now maintains user selection order
  - `preserveOrder: true` now sorts by items order

  This is a breaking change that corrects the behavior to match the intended specification.

- [#150](https://github.com/dadajam4/fastkit/pull/150) [`e9b7145`](https://github.com/dadajam4/fastkit/commit/e9b7145967bda75592dac5bc8102207575a160f5) Thanks [@nkenji09](https://github.com/nkenji09)! - Add preserveOrder option to FormSelectorControl

  This new option controls how selected items are ordered in multiple selection mode:

  - `preserveOrder: false` (default): Selected items are sorted according to the order they appear in the items array
  - `preserveOrder: true`: Selected items maintain the order in which they were selected by the user

  The option can be configured globally via `defaultPreserveOrder` in FormSelectorControlOptions or per-component via the `preserveOrder` prop.

## 0.20.28

### Patch Changes

- 以下の改善が含まれます。

  - `resetValidates()` を呼び出した際に、バリデーションの状態が正常にリセットされない不具合を修正しました。
  - `skipValidation()` を呼び出してもバリデーションが実行される不具合を修正しました。

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.12

## 0.20.27

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.11

## 0.20.26

### Patch Changes

- Added support for setting an `id` on the `FormSelectorItem` input element. This enables association with a `label` using the `for` attribute.

## 0.20.25

### Patch Changes

- Added support for setting a default value for autocomplete in text inputs. This feature is useful when building UIs, such as business applications, where autocomplete is generally unnecessary.

## 0.20.24

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.10

## 0.20.23

### Patch Changes

- Implemented a mechanism to assign unique IDs to nodes.

## 0.20.22

### Patch Changes

- Added an option to support datalist.

## 0.20.21

### Patch Changes

- Fixed a bug where input elements were still interactable when in viewonly mode.

## 0.20.20

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.9
  - @fastkit/helpers@0.14.5
  - @fastkit/dom@0.2.6
  - @fastkit/rules@0.14.7
  - @fastkit/tiny-logger@0.14.5

## 0.20.19

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.8

## 0.20.18

### Patch Changes

- Updated dependencies only.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.7

## 0.20.17

### Patch Changes

- Fixed an issue where validation was being triggered when resetting the state of form nodes.

## 0.20.16

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.6

## 0.20.15

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4
  - @fastkit/dom@0.2.5
  - @fastkit/rules@0.14.6
  - @fastkit/tiny-logger@0.14.4
  - @fastkit/vue-utils@0.15.5

## 0.20.14

### Patch Changes

- Fixed SelectorItem disabled condition.

## 0.20.13

### Patch Changes

- Corrected an issue where the input element of `SelectorItem` remained active when `viewonly` was enabled.

## 0.20.12

### Patch Changes

- Fixed a bug where an `invalid` node directly under FormNode was not recognized as invalidChildren.

## 0.20.11

### Patch Changes

- Modified the condition of `isAnySelected` in `DateInputNodeControl` from AND to OR.

## 0.20.10

### Patch Changes

- Added utility `mergeFormNodeRules` for merging rules of FormNode.

## 0.20.9

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3
  - @fastkit/dom@0.2.4
  - @fastkit/rules@0.14.5
  - @fastkit/tiny-logger@0.14.3
  - @fastkit/vue-utils@0.15.4

## 0.20.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/rules@0.14.4

## 0.20.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/rules@0.14.3

## 0.20.6

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2
  - @fastkit/dom@0.2.3
  - @fastkit/rules@0.14.2
  - @fastkit/tiny-logger@0.14.2
  - @fastkit/vue-utils@0.15.3

## 0.20.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.2

## 0.20.4

### Patch Changes

- When a falsy value is returned in the scroll handler function, the default scroll handler of vue-form-control is now executed. This enables finer control over the necessity of default scrolling within the application.

## 0.20.3

### Patch Changes

- Updated major dependencies.

## 0.20.2

### Patch Changes

- Fixed an issue where the finalization of values might not be completed during form or group actions and validation executions.

- Updated dependencies []:
  - @fastkit/dom@0.2.2

## 0.20.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.1
  - @fastkit/vue-utils@0.15.1
  - @fastkit/debounce@0.2.1
  - @fastkit/helpers@0.14.1
  - @fastkit/rules@0.14.1
  - @fastkit/dom@0.2.1

## 0.20.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:

  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/tiny-logger@0.14.0
  - @fastkit/vue-utils@0.15.0
  - @fastkit/debounce@0.2.0
  - @fastkit/helpers@0.14.0
  - @fastkit/rules@0.14.0
  - @fastkit/dom@0.2.0

## 0.19.19

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.17
  - @fastkit/debounce@0.1.2
  - @fastkit/helpers@0.13.8
  - @fastkit/rules@0.13.10
  - @fastkit/dom@0.1.8
  - @fastkit/tiny-logger@0.13.8

## 0.19.18

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.16

## 0.19.17

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.15

## 0.19.16

### Patch Changes

- Added an `extend` method for extending instances of FormNodeWrapper.

## 0.19.15

### Patch Changes

- Updated `@fastkit/rules` to allow configuration of functional validation rules.

- Updated dependencies []:
  - @fastkit/rules@0.13.9

## 0.19.14

### Patch Changes

- Implemented event notification for errors in automatic validation of `VueForm`.

## 0.19.13

### Patch Changes

- Implemented event notification upon completion of actions in `VueForm`.

## 0.19.12

### Patch Changes

- Fixed the issue where the required validation in `BoundableInputControl` was not functioning correctly.

## 0.19.11

### Patch Changes

- Adjusted the initialization of `errorMessage` customization in `FormNodeControl` to delay the execution of options, allowing reference to the form node instance.

## 0.19.10

### Patch Changes

- Allowed empty message types when registering custom error messages during the initialization of `FormNodeControl`.

## 0.19.9

### Patch Changes

- This is a release-specific changeset with no functional changes.

- [`a7dc035b`](https://github.com/dadajam4/fastkit/commit/a7dc035b699840483d728f5ae9e0a797db06cb64) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed the issue where the option type for extending `errorMessages` in `FormNodeControl` was not exposed.

## 0.19.8

### Patch Changes

- Added initialization option for `FormNodeControl` to include error messages.

## 0.19.7

### Patch Changes

- Removed unnecessary computed instances from the internal implementation of `vue-form-control`, improving performance.

## 0.19.6

### Patch Changes

- Added `FormSetControl` for associating multiple form nodes to collect state collectively.

## 0.19.5

### Patch Changes

- Fixed an issue where specifying `false` for `showOwnErrors` would still collect error messages at the group level, even when `collectErrorMessages` was not configured for the group.

## 0.19.4

### Patch Changes

- Modified the wrapper function for rendering errors to pass the instance of the form node to which the error belongs.

## 0.19.3

### Patch Changes

- Added an option for wrapping errors when rendering them using `renderAllErrors` in `FormNode`.

## 0.19.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.14

## 0.19.1

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.13

## 0.19.0

### Minor Changes

- Changed the name representation from `FormControl` to `FormNodeWrapper`. This release includes breaking changes.

## 0.18.0

### Minor Changes

- Added `Node` representation to types prone to collisions in the application, introducing breaking changes in this release.

  - DateInputControlPropsOptions → DateInputNodeControlPropsOptions
  - createDateInputProps → createDateInputNodeProps
  - createDateInputEmits → createDateInputNodeEmits
  - createDateInputSettings → createDateInputNodeSettings
  - DateInputControlOptions → DateInputNodeControlOptions
  - DateInputProps → DateInputNodeProps
  - DateInputContext → DateInputNodeControl
  - useDateInputControl → useDateInputNodeControl
  - createNumberInputProps → createNumberInputNodeProps
  - NumberInputProps → NumberInputNodeProps
  - createNumberInputEmits → createNumberInputNodeEmits
  - createNumberInputSettings → createNumberInputNodeSettings
  - createTextareaProps → createTextareaNodeProps
  - TextareaProps → TextareaNodeProps
  - createTextareaEmits → createTextareaNodeEmits
  - createTextareaSettings → createTextareaNodeSettings
  - TextareaEmitOptions → TextareaNodeEmitOptions
  - TextareaContext → TextareaNodeContext
  - TextareaControlOptions → TextareaNodeControlOptions
  - TextareaControl → TextareaNodeControl
  - useTextareaControl → useTextareaNodeControl
  - createTextInputProps → createTextInputNodeProps
  - TextInputProps → TextInputNodeProps
  - createTextInputEmits → createTextInputNodeEmits
  - TextInputEmits → TextInputNodeEmits
  - createTextInputSettings → createTextInputNodeSettings
  - TextInputEmitOptions → TextInputNodeEmitOptions
  - TextInputContext → TextInputNodeContext
  - TextInputControlOptions → TextInputNodeControlOptions
  - TextInputControl → TextInputNodeControl
  - useTextInputControl → useTextInputNodeControl

## 0.17.4

### Patch Changes

- Updated rendering of error messages in form groups and form nodes that inherit from them. Now, prioritizes applying its own slot to render messages for descendant nodes.

## 0.17.3

### Patch Changes

- When checking for the presence of a required condition in a form node, it previously checked rules with the name `required`. Now, it searches for both `required:*` and `*:required`, making it easier to create custom rules in applications, such as rules resembling required conditions.

## 0.17.2

### Patch Changes

- Fixed the issue of `required` rule initialization not occurring correctly in `BoundableInputControl`.

## 0.17.1

### Patch Changes

- Changed specification to allow flexible configuration of `required` setting, now accepting not only boolean values but also based on components.

  - `BoundableInputControl` now allows detailed configuration of `required` conditions for start and end values.

## 0.17.0

### Minor Changes

- This release includes various feature additions, improvements, and breaking changes.

  - The scroll helper configuration is now global and optional. By default, the [scrollIntoView](https://developer.mozilla.org/docs/Web/API/Element/scrollIntoView) method is utilized.
  - All nodes now internally hold the props passed to the component, eliminating unnecessary computed instances and improving performance.
  - The `isRequired` getter now takes into account mandatory conditions registered in the `rules`.
  - The type name 'FormFunctionableAction' has been changed to 'FormActionHandler'.
  - Added the `acceptInvalidSubmission` option to allow submission even in case of validation failure.
  - Added the `dispatchAction` method to manually invoke the submission action of `VueForm`.
  - Added `FormGroupControl` for grouping form nodes, facilitating the collection of validation messages. This allows displaying error messages in any location as needed.
  - Fixed Vue warning when setting a single object in the `rules` property.
  - Deprecated the `expose()` method across all nodes due to low usage demand.
  - Added the `extends` method to all FormNode-related instances, providing the ability to create objects that inherit the API of each node on the application side.

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7
  - @fastkit/rules@0.13.8
  - @fastkit/dom@0.1.7
  - @fastkit/tiny-logger@0.13.7
  - @fastkit/vue-utils@0.14.12

## 0.16.0

### Minor Changes

- Renamed `finishings` to `finalizers`.

## 0.15.45

### Patch Changes

- Fixed an issue where only the final processing was performed when multiple operations were specified in `finishings`.

- Updated dependencies []:
  - @fastkit/helpers@0.13.6
  - @fastkit/dom@0.1.6
  - @fastkit/rules@0.13.7
  - @fastkit/tiny-logger@0.13.6
  - @fastkit/vue-utils@0.14.11

## 0.15.44

### Patch Changes

- Fixed a bug where validation was not triggered upon detecting changes in FormNode rules.

## 0.15.43

### Patch Changes

- Fixed an issue where size detection would not be correctly performed when specifying `minRows` and `maxRows` for `VTextareaAutosize`.

## 0.15.42

### Patch Changes

- Fixed an issue where calculations would be offset when using `VTextareaAutosize` with a `textarea` containing padding.

## 0.15.41

### Patch Changes

- Added props-based selection state and corresponding conditional rendering logic to `FormSelector`.

## 0.15.40

### Patch Changes

- Fixed an issue where imask would cease to function upon changing the target element.

## 0.15.39

### Patch Changes

- Updated the return type of the `maskedValue` getter to string.

## 0.15.38

### Patch Changes

- Remove `viewonlyPlaceholder` Attribute.

## 0.15.37

### Patch Changes

- Added imask control reference for TextInputControl.

## 0.15.36

### Patch Changes

- Add `viewonlyPlaceholder` Attribute.

## 0.15.35

### Patch Changes

- Added ViewOnly attribute for FormControl.

## 0.15.34

### Patch Changes

- Added ViewOnly attribute.

## 0.15.33

### Patch Changes

- Changed the name of the guard attribute in FormSelector from `guard` to `onClickItem`.

## 0.15.32

### Patch Changes

- Modified the interface of arguments passed to the guard function in FormSelector.

## 0.15.31

### Patch Changes

- Added an attribute to FormSelector for guarding selection state changes.

## 0.15.30

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5
  - @fastkit/dom@0.1.5
  - @fastkit/rules@0.13.6
  - @fastkit/tiny-logger@0.13.5
  - @fastkit/vue-utils@0.14.10

## 0.15.29

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4
  - @fastkit/dom@0.1.4
  - @fastkit/rules@0.13.5
  - @fastkit/tiny-logger@0.13.4
  - @fastkit/vue-utils@0.14.9

## 0.15.28

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.8

## 0.15.27

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.7

## 0.15.26

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.6

## 0.15.25

### Patch Changes

- Added `formRef` getter to `VueForm` class.

## 0.15.24

### Patch Changes

- Added `nativeAction` getter to `VueForm` class.

## 0.15.23

### Patch Changes

- Updated dependencies [[`811800c`](https://github.com/dadajam4/fastkit/commit/811800c8aec5dc1236a887e35aa846560b8c40f7)]:
  - @fastkit/vue-utils@0.14.5

## 0.15.22

### Patch Changes

- [#136](https://github.com/dadajam4/fastkit/pull/136) [`a883849`](https://github.com/dadajam4/fastkit/commit/a8838498f34aa4c018f07def8ab2a2c1cbc055cd) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed selector group batch operations not working properly.

## 0.15.21

### Patch Changes

- [#134](https://github.com/dadajam4/fastkit/pull/134) [`40798ae`](https://github.com/dadajam4/fastkit/commit/40798ae0c15bebce59b287c671e8e14f59a8c683) Thanks [@dadajam4](https://github.com/dadajam4)! - Improved selector groups for more freedom of control.

## 0.15.20

### Patch Changes

- Updated dependencies [[`25885d2`](https://github.com/dadajam4/fastkit/commit/25885d2139c445478ce9aa7ff03539398f28cd55)]:
  - @fastkit/vue-utils@0.14.4

## 0.15.19

### Patch Changes

- [#130](https://github.com/dadajam4/fastkit/pull/130) [`a0afe06`](https://github.com/dadajam4/fastkit/commit/a0afe06f699d9208cb41b52c828d756ef5c53d2d) Thanks [@dadajam4](https://github.com/dadajam4)! - When a VueForm submit is executed, the submit event is now dispatched.
  This allows automatic validation and action handler calls to be performed even when a method is called.

## 0.15.18

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/helpers@0.13.3
  - @fastkit/debounce@0.1.1
  - @fastkit/dom@0.1.3
  - @fastkit/rules@0.13.4
  - @fastkit/tiny-logger@0.13.3
  - @fastkit/vue-utils@0.14.3

## 0.15.17

### Patch Changes

- [#120](https://github.com/dadajam4/fastkit/pull/120) [`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d) Thanks [@dadajam4](https://github.com/dadajam4)! - JSDocs were added and no-console lint improvements were made.

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/tiny-logger@0.13.2
  - @fastkit/helpers@0.13.2
  - @fastkit/dom@0.1.2
  - @fastkit/rules@0.13.3
  - @fastkit/vue-utils@0.14.2

## 0.15.16

### Patch Changes

- [#118](https://github.com/dadajam4/fastkit/pull/118) [`275ff19`](https://github.com/dadajam4/fastkit/commit/275ff19573c4f175890ccc157d6cbb29ccc69ca3) Thanks [@dadajam4](https://github.com/dadajam4)! - Added options to customize three states: isDisabled, isReadonly, and canOperation.

## 0.15.15

### Patch Changes

- [#112](https://github.com/dadajam4/fastkit/pull/112) [`7bc95bd`](https://github.com/dadajam4/fastkit/commit/7bc95bdd725704891476079f305e28913efa6230) Thanks [@dadajam4](https://github.com/dadajam4)! - We have enabled the detection of skipped selections in the handler when options have already been chosen. This allows us to implement UI features such as closing the dropdown menu.

## 0.15.14

### Patch Changes

- Updated dependencies [[`29f8daa`](https://github.com/dadajam4/fastkit/commit/29f8daa3ad94d6b013df572affd07b55d2078471)]:
  - @fastkit/rules@0.13.2

## 0.15.13

### Patch Changes

- [#108](https://github.com/dadajam4/fastkit/pull/108) [`1a1edf0`](https://github.com/dadajam4/fastkit/commit/1a1edf067d800500525f0832ac361b7c13e8b365) Thanks [@dadajam4](https://github.com/dadajam4)! - Improved the behavior and interface of text masks.

## 0.15.12

### Patch Changes

- [#106](https://github.com/dadajam4/fastkit/pull/106) [`1b573ea`](https://github.com/dadajam4/fastkit/commit/1b573ea2f02165154c9d1976997849cd5134db3d) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed an erroneous min constraint for max value validation of up/down system input.

## 0.15.11

### Patch Changes

- Re-release due to incomplete release.

## 0.15.10

### Patch Changes

- [#104](https://github.com/dadajam4/fastkit/pull/104) [`50293da`](https://github.com/dadajam4/fastkit/commit/50293daca0a56462951ecb64370c70120d120a11) Thanks [@dadajam4](https://github.com/dadajam4)! - Added option to omit the year in the end date format.

## 0.15.9

### Patch Changes

- [#102](https://github.com/dadajam4/fastkit/pull/102) [`c6a762e`](https://github.com/dadajam4/fastkit/commit/c6a762ef12afd5961748e56b3ad119af0bd2aa50) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed failure to initialize controls for boundable input.

## 0.15.8

### Patch Changes

- [#100](https://github.com/dadajam4/fastkit/pull/100) [`00473e6`](https://github.com/dadajam4/fastkit/commit/00473e6bd88eae75ebb1c6797c21c42776579514) Thanks [@dadajam4](https://github.com/dadajam4)! - Added support for values such as date and time that have an up/down relationship and are also range-selected.

## 0.15.7

### Patch Changes

- [#98](https://github.com/dadajam4/fastkit/pull/98) [`4b4f647`](https://github.com/dadajam4/fastkit/commit/4b4f6476cd68d8d71ab0e8f0df9db2ed2dd608ef) Thanks [@dadajam4](https://github.com/dadajam4)! - There are no changes to this release.
  This is a re-release due to a correction of an error in the settings of Changesets.

- [#97](https://github.com/dadajam4/fastkit/pull/97) [`76c39a0`](https://github.com/dadajam4/fastkit/commit/76c39a0b82f538a3fd6752e7eb05151bf1ad1d5d) Thanks [@dadajam4](https://github.com/dadajam4)! - Trial release for changes in changeset format.

## 0.15.6

### Patch Changes

- [#95](https://github.com/dadajam4/fastkit/pull/95) [`dab8427`](https://github.com/dadajam4/fastkit/commit/dab8427d9ad56801ea1b65f4ec31f5da96d00595) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed a problem where validation would work when `change` was specified for Validate timing, even though the value had not been changed.

## 0.15.5

### Patch Changes

- [#93](https://github.com/dadajam4/fastkit/pull/93) [`da55ca8`](https://github.com/dadajam4/fastkit/commit/da55ca8725218849d65e06cade30a342ff299059) Thanks [@dadajam4](https://github.com/dadajam4)! - Improved slot types and extended API so that FormNode can also render errors.

## 0.15.4

### Patch Changes

- [#77](https://github.com/dadajam4/fastkit/pull/77) [`1f8ee9e`](https://github.com/dadajam4/fastkit/commit/1f8ee9e42d4a1c8e0d627a2ccad56862694781ae) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed a bug that prevented error messages set manually to FormControl from being reflected as error messages.

## 0.15.3

### Patch Changes

- [#75](https://github.com/dadajam4/fastkit/pull/75) [`6b4ebd5`](https://github.com/dadajam4/fastkit/commit/6b4ebd5422a41f2a09d8023d8f3c01a385b616de) Thanks [@dadajam4](https://github.com/dadajam4)! - Added option for common resolution of form validation error messages.

## 0.15.2

### Patch Changes

- [#73](https://github.com/dadajam4/fastkit/pull/73) [`8e25df8`](https://github.com/dadajam4/fastkit/commit/8e25df840c83d63617f5f343939fc22abf06b4a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Added support for controlling the display state of passwords in TextInputControl.

- Updated dependencies [[`8e25df8`](https://github.com/dadajam4/fastkit/commit/8e25df840c83d63617f5f343939fc22abf06b4a0)]:
  - @fastkit/vue-utils@0.14.1

## 0.15.1

### Patch Changes

- [#71](https://github.com/dadajam4/fastkit/pull/71) [`46f2f16`](https://github.com/dadajam4/fastkit/commit/46f2f16e5b54643b01fbcd8bb173330ef23d21ee) Thanks [@dadajam4](https://github.com/dadajam4)! - I have fixed the issue where text-based components were not properly initialized when validateTiming was set to `always`.

## 0.15.0

### Minor Changes

- [#49](https://github.com/dadajam4/fastkit/pull/49) [`53af680`](https://github.com/dadajam4/fastkit/commit/53af680b854d7f5f86c36f1ab51e43043f49eaa5) Thanks [@dadajam4](https://github.com/dadajam4)! - - Added JSDocs and improved code hints.
  - Property names with incorrect meanings have been corrected(`submiting` to `sending`).

## 0.14.1

### Patch Changes

- [#43](https://github.com/dadajam4/fastkit/pull/43) [`258cebe`](https://github.com/dadajam4/fastkit/commit/258cebe3a2a24deab71e7e5ffd9c5dd310e9cd24) Thanks [@dadajam4](https://github.com/dadajam4)! - Improved behavior of single radio not belonging to a group.

## 0.14.0

### Minor Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Updated Vue to improve type support for slots, etc.
  This improvement is based on the following Vue.js 3.3 release

  https://blog.vuejs.org/posts/vue-3-3

### Patch Changes

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/vue-utils@0.14.0

## 0.13.1

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1
  - @fastkit/dom@0.1.1
  - @fastkit/rules@0.13.1
  - @fastkit/tiny-logger@0.13.1
  - @fastkit/vue-utils@0.13.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
