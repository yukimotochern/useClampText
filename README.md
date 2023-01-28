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
```jsx
const component = () => {
  const {
    longEnoughToClamp,
    textContainerRef,
    addOnsContainerRef,
    wrapperContainerRef,
    clamped,
    clampedText,
    toggleClamp
  } = useClampText({
    originalText: 'some potentially really long text...',
    lines: 2, // At most how many lines
    endSpaceNumber: 4, // how many trailing space,
    unitSpaceChar: '*' // single trailing space should be the width of this char
  })
  return <WrapperContainer ref={wrapperContainerRef}>
    <TextContainer ref={textContainerRef}>
      {clampedText}
    <TextContainer/>
    {longEnoughToClamp ? (
      <AddOnsContainer ref={addOnsContainerRef} onClick={toggleClamp}>
          {clamped ? 'Show more' : 'Show less'}
      <AddOnsContainer/>
    ) : null}
  <WrapperContainer/>
}
```

## API reference

### Arguments

- originalText: text to clamp
- lines: max line number
- debounceTime: debounce time in microseconds when windows resize
- minSpaceCharNum: the minium trailing space number, will make the process of adding space to the end of the addons component more efficient.
- unitSpaceChar: the width of single trailing space, pass a char for the width
- endSpaceNumber: how many trailing spaces

### Returns

- longEnoughtToClamp: whether the text is currently exceeds the max line number
- clamped: whether the text should be clamped if long enough
- clampedText: current text
- toggleClamp: toggle the clamped state
- wrapperContainerRef, textContainerRef, addOnsContainerRef: Ref for corresponding containers