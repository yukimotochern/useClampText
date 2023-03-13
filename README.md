# use-clamp-text hook: useClampText

Custom react hook that clamp multiline text to a specified line number. Can optionally specify trailing spaces.
Fix some bugs and use cleaner implementation. Modified from:

- https://github.com/drenther/use-clamp-text/blob/main/src/index.ts
- https://github.com/zoltantothcom/react-clamp-lines/blob/master/src/index.js

## Install

```bash
npm i @yukimoto/use-clamp-text
```

## Usage

```tsx
const component = () => {
  const {
    longEnoughToClamp,
    textContainerRef,
    addOnsContainerRef,
    wrapperContainerRef,
    clamped,
    clampedText,
    toggleClamp,
  } = useClampText<{
    WrapperContainer: HTMLDivElement;
    TextContainer: HTMLSpanElement;
    AddonsContainer: HTMLButtonElement;
  }>({
    originalText: 'some potentially really long text...',
    lines: 2, // At most how many lines
    endSpaceNumber: 4, // how many trailing space,
    unitSpaceChar: '*', // single trailing space should be the width of this char
    debounceTime: 100, // in miliseconds
  });
  return (
    <div ref={wrapperContainerRef}>
      <span ref={textContainerRef}>{clampedText}</span>
      {longEnoughToClamp ? (
        <button ref={addOnsContainerRef} onClick={toggleClamp}>
          {clamped ? '...show more' : '...show less'}
        </button>
      ) : null}
    </div>
  );
};
```

## API reference

### Arguments

| property        | type     | required | default | description                                                                                                                |
| --------------- | -------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| originalText    | `string` | `false`  | `''`    | Text you wish to clamp.                                                                                                    |
| lines           | `number` | `false`  | `2`     | Number of visible lines when collapsed.                                                                                    |
| debounceTime    | `number` | `false`  | `300`   | How many time in miliseconds before the clamp action will be triggered when window resizes.                                |
| minSpaceCharNum | `number` | `false`  | `0`     | The minium trailing space number, will make the process of adding space to the end of the addons component more efficient. |
| unitSpaceChar   | `string` | `false`  | `'.'`   | The width of single trailing space, pass a char for the measurement of width.                                              |
| endSpaceNumber  | `number` | `false`  | `0`     | How many trailing spaces. Each of them will be the width of `unitSpaceChar`.                                               |

### Returns

| property                                                  | type                                     | description                                                                                |
| --------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| longEnoughtToClamp                                        | `boolean`                                | Whether the `originalText` is longer enough to exceeds the given `line` number by it self. |
| clampedText                                               | `string`                                 | The string to be rendered.                                                                 |
| clamped                                                   | `boolean`                                | A state indicating whether the text should be clamped if long enough.                      |
| toggleClamp                                               | `() => void`                             | A callback which togger the `clamped` state.                                               |
| wrapperContainerRef, textContainerRef, addOnsContainerRef | `React.RefObject<E extends HTMLElement>` | Ref for corresponding containers.                                                          |
