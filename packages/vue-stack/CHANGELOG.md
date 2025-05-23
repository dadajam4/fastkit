# @fastkit/vue-stack

## 0.16.17

### Patch Changes

- Added `forceEdgeMargin` option to VMenu to always enforce `edgeMargin` from the screen edge, preventing snapping outside the margin.

## 0.16.16

### Patch Changes

- Fixed the style of the slide animation.

## 0.16.15

### Patch Changes

- Added an option to automatically hide floating elements.

## 0.16.14

### Patch Changes

- Improved: Pointer no longer responds during slide transitions.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.10
  - @fastkit/vue-body-scroll-lock@0.2.11
  - @fastkit/vue-click-outside@0.2.10
  - @fastkit/vue-resize@0.2.10
  - @fastkit/vue-transitions@0.2.11

## 0.16.13

### Patch Changes

- Fixed an issue where the y-coordinate of the Menu bubble would shift due to scrolling.

## 0.16.12

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.9
  - @fastkit/helpers@0.14.5
  - @fastkit/vue-body-scroll-lock@0.2.10
  - @fastkit/vue-click-outside@0.2.9
  - @fastkit/vue-resize@0.2.9
  - @fastkit/vue-transitions@0.2.10
  - @fastkit/dom@0.2.6
  - @fastkit/tiny-logger@0.14.5
  - @fastkit/vue-keyboard@0.2.5

## 0.16.11

### Patch Changes

- Updated dependencies.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.8
  - @fastkit/vue-body-scroll-lock@0.2.9
  - @fastkit/vue-click-outside@0.2.8
  - @fastkit/vue-resize@0.2.8
  - @fastkit/vue-transitions@0.2.9

## 0.16.10

### Patch Changes

- Fixed an issue where the focus would be lost from the initially focused element when starting the stack.

## 0.16.9

### Patch Changes

- Updated dependencies only.

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.7
  - @fastkit/vue-body-scroll-lock@0.2.8
  - @fastkit/vue-click-outside@0.2.7
  - @fastkit/vue-resize@0.2.7
  - @fastkit/vue-transitions@0.2.8

## 0.16.8

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.6
  - @fastkit/vue-body-scroll-lock@0.2.7
  - @fastkit/vue-click-outside@0.2.6
  - @fastkit/vue-resize@0.2.6
  - @fastkit/vue-transitions@0.2.7

## 0.16.7

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.4
  - @fastkit/dom@0.2.5
  - @fastkit/tiny-logger@0.14.4
  - @fastkit/vue-body-scroll-lock@0.2.6
  - @fastkit/vue-resize@0.2.5
  - @fastkit/vue-transitions@0.2.6
  - @fastkit/vue-utils@0.15.5
  - @fastkit/vue-keyboard@0.2.4
  - @fastkit/vue-click-outside@0.2.5

## 0.16.6

### Patch Changes

- I've added the following features to the stack:

  - Added `disabled` option to the stack.
  - Added missing stack control type to MenuAPI.

## 0.16.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.3
  - @fastkit/dom@0.2.4
  - @fastkit/tiny-logger@0.14.3
  - @fastkit/vue-body-scroll-lock@0.2.5
  - @fastkit/vue-resize@0.2.4
  - @fastkit/vue-transitions@0.2.5
  - @fastkit/vue-utils@0.15.4
  - @fastkit/vue-keyboard@0.2.3
  - @fastkit/vue-click-outside@0.2.4

## 0.16.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.14.2
  - @fastkit/dom@0.2.3
  - @fastkit/tiny-logger@0.14.2
  - @fastkit/vue-body-scroll-lock@0.2.4
  - @fastkit/vue-resize@0.2.3
  - @fastkit/vue-transitions@0.2.4
  - @fastkit/vue-utils@0.15.3
  - @fastkit/vue-keyboard@0.2.2
  - @fastkit/vue-click-outside@0.2.3

## 0.16.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.15.2
  - @fastkit/vue-body-scroll-lock@0.2.3
  - @fastkit/vue-click-outside@0.2.2
  - @fastkit/vue-resize@0.2.2
  - @fastkit/vue-transitions@0.2.3

## 0.16.2

### Patch Changes

- Updated dependencies []:
  - @fastkit/dom@0.2.2
  - @fastkit/vue-body-scroll-lock@0.2.2
  - @fastkit/vue-transitions@0.2.2

## 0.16.1

### Patch Changes

- Reverted the removal of the `main` field that was introduced in the previous release and restored support for the old `moduleResolution`.

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.2.1
  - @fastkit/vue-click-outside@0.2.1
  - @fastkit/vue-transitions@0.2.1
  - @fastkit/vue-keyboard@0.2.1
  - @fastkit/tiny-logger@0.14.1
  - @fastkit/vue-resize@0.2.1
  - @fastkit/vue-utils@0.15.1
  - @fastkit/helpers@0.14.1
  - @fastkit/dom@0.2.1

## 0.16.0

### Minor Changes

- This release includes no functional changes, but it contains the following important updates:

  - Now adheres to ES Modules and the latest TypeScript standards, and the output for the `main` field and `typesVersions` is no longer generated.

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.2.0
  - @fastkit/vue-click-outside@0.2.0
  - @fastkit/vue-transitions@0.2.0
  - @fastkit/vue-keyboard@0.2.0
  - @fastkit/tiny-logger@0.14.0
  - @fastkit/vue-resize@0.2.0
  - @fastkit/vue-utils@0.15.0
  - @fastkit/helpers@0.14.0
  - @fastkit/dom@0.2.0

## 0.15.53

### Patch Changes

- Refactored internal implementation due to a review of ESLint rules, with no changes to the specifications.

- Updated dependencies []:
  - @fastkit/vue-body-scroll-lock@0.1.19
  - @fastkit/vue-click-outside@0.1.20
  - @fastkit/vue-resize@0.1.19
  - @fastkit/vue-utils@0.14.17
  - @fastkit/helpers@0.13.8
  - @fastkit/dom@0.1.8
  - @fastkit/vue-transitions@0.1.23
  - @fastkit/vue-keyboard@0.1.8
  - @fastkit/tiny-logger@0.13.8

## 0.15.52

### Patch Changes

- Fixed cases where `cancelHandler` was not being dispatched, such as when the ESC key was pressed.

## 0.15.51

### Patch Changes

- Added the `guardInProgressType` getter to check the type of the stack resolution handler currently in progress.

## 0.15.50

### Patch Changes

- Added `cancelHandler` to handle stack resolution with negative values, allowing for asynchronous handling when resolving the stack with negative values.

## 0.15.49

### Patch Changes

- Added the `resolveHandler` option for performing custom validation and asynchronous processing in the stack's resolve process, along with the `guardInProgress` getter to determine if asynchronous processing is in progress.

  Additionally, fixed an issue where the stack was hidden even on failed navigation when `closeOnNavigation` was set to `true`.

## 0.15.48

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.16
  - @fastkit/vue-body-scroll-lock@0.1.18
  - @fastkit/vue-click-outside@0.1.19
  - @fastkit/vue-resize@0.1.18
  - @fastkit/vue-transitions@0.1.22

## 0.15.47

### Patch Changes

- Fixed an issue with the incorrect placement of class and style attributes when `manualAttrs` is set to `true`.

## 0.15.46

### Patch Changes

- Added options for manually rendering the class and style attributes of Stack elements.

## 0.15.45

### Patch Changes

- Added the ability to specify options for `closeOnOutsideClick` and `persistent` when initializing the stack.

## 0.15.44

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.15
  - @fastkit/vue-body-scroll-lock@0.1.17
  - @fastkit/vue-click-outside@0.1.18
  - @fastkit/vue-resize@0.1.17
  - @fastkit/vue-transitions@0.1.21

## 0.15.43

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-transitions@0.1.20

## 0.15.42

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-transitions@0.1.19

## 0.15.41

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-transitions@0.1.18

## 0.15.40

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.14
  - @fastkit/vue-body-scroll-lock@0.1.16
  - @fastkit/vue-click-outside@0.1.17
  - @fastkit/vue-resize@0.1.16
  - @fastkit/vue-transitions@0.1.17

## 0.15.39

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.13
  - @fastkit/vue-body-scroll-lock@0.1.15
  - @fastkit/vue-click-outside@0.1.16
  - @fastkit/vue-resize@0.1.15
  - @fastkit/vue-transitions@0.1.16

## 0.15.38

### Patch Changes

- Fixed an issue in the Tab key-based closing process where the `not-focused` evaluation was not functioning correctly.

## 0.15.37

### Patch Changes

- Added an option for automatically closing the stack with the Tab key.

## 0.15.36

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.7
  - @fastkit/dom@0.1.7
  - @fastkit/tiny-logger@0.13.7
  - @fastkit/vue-body-scroll-lock@0.1.14
  - @fastkit/vue-resize@0.1.14
  - @fastkit/vue-transitions@0.1.15
  - @fastkit/vue-utils@0.14.12
  - @fastkit/vue-keyboard@0.1.7
  - @fastkit/vue-click-outside@0.1.15

## 0.15.35

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.6
  - @fastkit/dom@0.1.6
  - @fastkit/tiny-logger@0.13.6
  - @fastkit/vue-body-scroll-lock@0.1.13
  - @fastkit/vue-resize@0.1.13
  - @fastkit/vue-transitions@0.1.14
  - @fastkit/vue-utils@0.14.11
  - @fastkit/vue-keyboard@0.1.6
  - @fastkit/vue-click-outside@0.1.14

## 0.15.34

### Patch Changes

- Added the ability to specify the initial value for `backdrop` during the initialization of `VDialog`.

## 0.15.33

### Patch Changes

- Added the ability to specify the initial value for `scrollLock` during the initialization of `VDialog`.

## 0.15.32

### Patch Changes

- Added JSDoc to Stack-related implementation

## 0.15.31

### Patch Changes

- Changed Menu component's free size specification from `false` to conform to maximum size specification, set to `"free"`.

## 0.15.30

### Patch Changes

- Added the capability to disable properties associated with the size of the Menu component by setting them to `false`.

## 0.15.29

### Patch Changes

- Fixed an issue where coordinate calculations were incorrect when specifying `disallow` for the `overlap` attribute.

## 0.15.28

### Patch Changes

- Extended `overlap` attribute in the menu component, adding settings to prevent overlap with the activator.

## 0.15.27

### Patch Changes

- Exposed CSS variables for coordinates to facilitate easier rendering of speech bubble-style UI.

## 0.15.26

### Patch Changes

- Implemented the ability to set minimum width and height for the Menu component.

## 0.15.25

### Patch Changes

- Added the ability to dynamically set an object to the `attrs` option in the Menu component using a function.

## 0.15.24

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.5
  - @fastkit/dom@0.1.5
  - @fastkit/tiny-logger@0.13.5
  - @fastkit/vue-body-scroll-lock@0.1.12
  - @fastkit/vue-resize@0.1.12
  - @fastkit/vue-transitions@0.1.13
  - @fastkit/vue-utils@0.14.10
  - @fastkit/vue-keyboard@0.1.5
  - @fastkit/vue-click-outside@0.1.13

## 0.15.23

### Patch Changes

- Updated dependencies []:
  - @fastkit/helpers@0.13.4
  - @fastkit/dom@0.1.4
  - @fastkit/tiny-logger@0.13.4
  - @fastkit/vue-body-scroll-lock@0.1.11
  - @fastkit/vue-resize@0.1.11
  - @fastkit/vue-transitions@0.1.12
  - @fastkit/vue-utils@0.14.9
  - @fastkit/vue-keyboard@0.1.4
  - @fastkit/vue-click-outside@0.1.12

## 0.15.22

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.8
  - @fastkit/vue-body-scroll-lock@0.1.10
  - @fastkit/vue-click-outside@0.1.11
  - @fastkit/vue-resize@0.1.10
  - @fastkit/vue-transitions@0.1.11

## 0.15.21

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.7
  - @fastkit/vue-body-scroll-lock@0.1.9
  - @fastkit/vue-click-outside@0.1.10
  - @fastkit/vue-resize@0.1.9
  - @fastkit/vue-transitions@0.1.10

## 0.15.20

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-utils@0.14.6
  - @fastkit/vue-body-scroll-lock@0.1.8
  - @fastkit/vue-click-outside@0.1.9
  - @fastkit/vue-resize@0.1.8
  - @fastkit/vue-transitions@0.1.9

## 0.15.19

### Patch Changes

- Now accepts an `include` option to pass to the `click-outside` directive.

- Updated dependencies []:
  - @fastkit/vue-click-outside@0.1.8

## 0.15.18

### Patch Changes

- Updated dependencies [[`811800c`](https://github.com/dadajam4/fastkit/commit/811800c8aec5dc1236a887e35aa846560b8c40f7)]:
  - @fastkit/vue-utils@0.14.5
  - @fastkit/vue-body-scroll-lock@0.1.7
  - @fastkit/vue-click-outside@0.1.7
  - @fastkit/vue-resize@0.1.7
  - @fastkit/vue-transitions@0.1.8

## 0.15.17

### Patch Changes

- Updated dependencies [[`25885d2`](https://github.com/dadajam4/fastkit/commit/25885d2139c445478ce9aa7ff03539398f28cd55)]:
  - @fastkit/vue-utils@0.14.4
  - @fastkit/vue-body-scroll-lock@0.1.6
  - @fastkit/vue-click-outside@0.1.6
  - @fastkit/vue-resize@0.1.6
  - @fastkit/vue-transitions@0.1.7

## 0.15.16

### Patch Changes

- [#122](https://github.com/dadajam4/fastkit/pull/122) [`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e) Thanks [@dadajam4](https://github.com/dadajam4)! - Update major and non-major packages

- Updated dependencies [[`d0c96fa`](https://github.com/dadajam4/fastkit/commit/d0c96faf96b6c91bcb8bc0b1ca9d22fc8ede303e)]:
  - @fastkit/helpers@0.13.3
  - @fastkit/dom@0.1.3
  - @fastkit/tiny-logger@0.13.3
  - @fastkit/vue-body-scroll-lock@0.1.5
  - @fastkit/vue-click-outside@0.1.5
  - @fastkit/vue-keyboard@0.1.3
  - @fastkit/vue-resize@0.1.5
  - @fastkit/vue-transitions@0.1.6
  - @fastkit/vue-utils@0.14.3

## 0.15.15

### Patch Changes

- Updated dependencies [[`5b881b9`](https://github.com/dadajam4/fastkit/commit/5b881b94ce1852c12cc3c8f6954564d5235cba4d)]:
  - @fastkit/tiny-logger@0.13.2
  - @fastkit/helpers@0.13.2
  - @fastkit/dom@0.1.2
  - @fastkit/vue-body-scroll-lock@0.1.4
  - @fastkit/vue-resize@0.1.4
  - @fastkit/vue-transitions@0.1.5
  - @fastkit/vue-utils@0.14.2
  - @fastkit/vue-keyboard@0.1.2
  - @fastkit/vue-click-outside@0.1.4

## 0.15.14

### Patch Changes

- [#100](https://github.com/dadajam4/fastkit/pull/100) [`00473e6`](https://github.com/dadajam4/fastkit/commit/00473e6bd88eae75ebb1c6797c21c42776579514) Thanks [@dadajam4](https://github.com/dadajam4)! - - Removed package [vue-color-scheme](https://github.com/dadajam4/fastkit/tree/main/packages/vue-color-scheme) that were no longer needed.
  - Fixed the `allowOverflow` setting on the menu component so that it will properly extend off the screen instead of trying to fit inside the screen.

## 0.15.13

### Patch Changes

- Updated dependencies []:
  - @fastkit/vue-color-scheme@0.14.3

## 0.15.12

### Patch Changes

- [#83](https://github.com/dadajam4/fastkit/pull/83) [`77cb4b0`](https://github.com/dadajam4/fastkit/commit/77cb4b04367d755f94ec96db1bdd92e81cbb1033) Thanks [@dadajam4](https://github.com/dadajam4)! - Scale transition did not animate correctly when leave.

## 0.15.11

### Patch Changes

- [#81](https://github.com/dadajam4/fastkit/pull/81) [`686710f`](https://github.com/dadajam4/fastkit/commit/686710fb445e1a1811caa2ae6ae8021df5d6d6ec) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed that the coordinates were not properly normalized when the maximum size (width/height) of Menu was specified.

## 0.15.10

### Patch Changes

- [#79](https://github.com/dadajam4/fastkit/pull/79) [`a41463c`](https://github.com/dadajam4/fastkit/commit/a41463cfbaa9a3082022098d7348438e77c0787a) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed that the coordinates were not properly normalized when the maximum size (width/height) of Menu was specified.

## 0.15.9

### Patch Changes

- [#77](https://github.com/dadajam4/fastkit/pull/77) [`1f8ee9e`](https://github.com/dadajam4/fastkit/commit/1f8ee9e42d4a1c8e0d627a2ccad56862694781ae) Thanks [@dadajam4](https://github.com/dadajam4)! - The maximum size of the Menu component can now be set by a custom function.

## 0.15.8

### Patch Changes

- Updated dependencies [[`8e25df8`](https://github.com/dadajam4/fastkit/commit/8e25df840c83d63617f5f343939fc22abf06b4a0)]:
  - @fastkit/vue-utils@0.14.1
  - @fastkit/vue-body-scroll-lock@0.1.3
  - @fastkit/vue-click-outside@0.1.3
  - @fastkit/vue-color-scheme@0.14.2
  - @fastkit/vue-resize@0.1.3
  - @fastkit/vue-transitions@0.1.4

## 0.15.7

### Patch Changes

- Updated dependencies [[`46f2f16`](https://github.com/dadajam4/fastkit/commit/46f2f16e5b54643b01fbcd8bb173330ef23d21ee)]:
  - @fastkit/vue-transitions@0.1.3

## 0.15.6

### Patch Changes

- [#69](https://github.com/dadajam4/fastkit/pull/69) [`8c2c6f5`](https://github.com/dadajam4/fastkit/commit/8c2c6f5b3de2214107ae355980168e74e91de65d) Thanks [@dadajam4](https://github.com/dadajam4)! - Improved the menu component generated by `defineMenuComponent()`, where the calculation process of coordinates in resizing menus and activators failed in some cases.

## 0.15.5

### Patch Changes

- [#67](https://github.com/dadajam4/fastkit/pull/67) [`93488f2`](https://github.com/dadajam4/fastkit/commit/93488f21251f32ed5d577f854146815bd6307161) Thanks [@dadajam4](https://github.com/dadajam4)! - Rebuild in build dependency update.

- Updated dependencies []:
  - @fastkit/vue-color-scheme@0.14.1

## 0.15.4

### Patch Changes

- [#63](https://github.com/dadajam4/fastkit/pull/63) [`ab6cdcb`](https://github.com/dadajam4/fastkit/commit/ab6cdcb48db76782cbac6000f65fc3748d742919) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed incorrect coordinates when backdrop elements are displayed while content is scrolled.

## 0.15.3

### Patch Changes

- [#61](https://github.com/dadajam4/fastkit/pull/61) [`04717a8`](https://github.com/dadajam4/fastkit/commit/04717a8b395e07ae14268e2eb2f6c46db575c64d) Thanks [@dadajam4](https://github.com/dadajam4)! - Fixed incorrect tracking of activators when controlling the Stack menu with v-models and improved behavior.

## 0.15.2

### Patch Changes

- [#59](https://github.com/dadajam4/fastkit/pull/59) [`bb78094`](https://github.com/dadajam4/fastkit/commit/bb7809429fecab3e97106c111a1cb7a0c7686f3c) Thanks [@dadajam4](https://github.com/dadajam4)! - Applications like Storybook instantiate multiple Vue applications. I have made modifications to ensure that even in such cases, vue-stack can accurately track the position.

## 0.15.1

### Patch Changes

- [#57](https://github.com/dadajam4/fastkit/pull/57) [`b4f0281`](https://github.com/dadajam4/fastkit/commit/b4f0281a2a0cabbc5789f3f158462a3f3e918272) Thanks [@dadajam4](https://github.com/dadajam4)! - Improved tracking of coordinates of menu elements to activator elements.

## 0.15.0

### Minor Changes

- [#53](https://github.com/dadajam4/fastkit/pull/53) [`326fa29`](https://github.com/dadajam4/fastkit/commit/326fa29bf34fe8501be6c5a4fa190244d1068090) Thanks [@dadajam4](https://github.com/dadajam4)! - We have made vue-stack more headless and easier to customize.

### Patch Changes

- Updated dependencies [[`326fa29`](https://github.com/dadajam4/fastkit/commit/326fa29bf34fe8501be6c5a4fa190244d1068090)]:
  - @fastkit/vue-color-scheme@0.14.0

## 0.14.0

### Minor Changes

- [#39](https://github.com/dadajam4/fastkit/pull/39) [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0) Thanks [@dadajam4](https://github.com/dadajam4)! - Updated Vue to improve type support for slots, etc.
  This improvement is based on the following Vue.js 3.3 release

  https://blog.vuejs.org/posts/vue-3-3

### Patch Changes

- Updated dependencies [[`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0), [`40ee82f`](https://github.com/dadajam4/fastkit/commit/40ee82f4501b88e44ad9b67918df2237298493a0)]:
  - @fastkit/vue-utils@0.14.0
  - @fastkit/vue-color-scheme@0.13.6
  - @fastkit/vue-body-scroll-lock@0.1.2
  - @fastkit/vue-click-outside@0.1.2
  - @fastkit/vue-resize@0.1.2
  - @fastkit/vue-transitions@0.1.2
  - @fastkit/color-scheme@1.0.6

## 0.13.5

### Patch Changes

- Updated dependencies []:
  - @fastkit/color-scheme@1.0.5
  - @fastkit/vue-color-scheme@0.13.5

## 0.13.4

### Patch Changes

- Updated dependencies []:
  - @fastkit/color-scheme@1.0.4
  - @fastkit/vue-color-scheme@0.13.4

## 0.13.3

### Patch Changes

- Updated dependencies []:
  - @fastkit/color-scheme@1.0.3
  - @fastkit/vue-color-scheme@0.13.3

## 0.13.2

### Patch Changes

- Updated dependencies [[`3ed3703a`](https://github.com/dadajam4/fastkit/commit/3ed3703aa9092bf47caed6ec192ef4d5a7621d34)]:
  - @fastkit/helpers@0.13.1
  - @fastkit/dom@0.1.1
  - @fastkit/tiny-logger@0.13.1
  - @fastkit/vue-body-scroll-lock@0.1.1
  - @fastkit/vue-resize@0.1.1
  - @fastkit/vue-transitions@0.1.1
  - @fastkit/vue-utils@0.13.1
  - @fastkit/vue-keyboard@0.1.1
  - @fastkit/color-scheme@1.0.2
  - @fastkit/vue-color-scheme@0.13.2
  - @fastkit/vue-click-outside@0.1.1

## 0.13.1

### Patch Changes

- Updated dependencies []:
  - @fastkit/color-scheme@1.0.1
  - @fastkit/vue-color-scheme@0.13.1

## 0.13.0

### Minor Changes

- First Release in Repository Migration.
