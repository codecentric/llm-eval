# Accessiblity Checklist for developing

1. Labels for form controls

ex:

```html
<!-- label can be hidden -->
<label for="username">Username</label>
<input id="username" type="text" name="username" />
```

2. Alt-text for images

3. page language

ex:

```html
<html lang="de"></html>
```

4. use semantic html tags

ex:

```html
<time datetime="2015-08-07">7 Aug 2015</time>
```

5. to make an element accessible with `Tab` set tabIndex={0},
   the rule "jsx-a11y/no-noninteractive-tabindex" is disabled
   which will help the user focus to the related element to improve UX and not skip important detail

6. use the custom toast object in

```js
import { toast } from "@/app/[locale]/(authenticated)/helpers/toast";
```

which will focus the toasts and make sure the screen reader reads it, it's not a good solution when multiple toasts appear at the same time.

7. make sure to use readable date formats like: 13. Oktober 2024 instead of 13/10/2024

8. table cells should have the aria-label for their column name, so that the screen reader reads: <column name> <value of cell> for better understandibility

9. a hidden link to skip navigation in the navigation pane, is visible on focus hidden otherwise.

Last: use voice over on macos to feel what it's like to use the UI, if it's not user-friendly, improve by your self-feedback.
