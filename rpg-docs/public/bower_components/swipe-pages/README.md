swipe-pages
================

See the [component page](http://TheSeamau5.github.io/swipe-pages) for more information.


## TODO

- [x] Improve page scroll stability
- [x] Improve page scroll performance
- [ ] Improve performance in swiping between pages (by reusing pages?)
- [x] Have pages scroll down independently of each other
- [ ] Make element play nicer with the polymer core-elements (like core-scroll-header-panel and core-list)
- [ ] Add option to mark each page with a browser tag to resume state from url
- [x] Include sane defaults for hardware acceleration (translateZ hack in the right places)
- [ ] Make a nicer demo with more features to better explain the element
- [ ] Add option to reverse direction for rtl languages
- [ ] Do some more rigorous testing to ensure stability!!!
- [ ] Allow for individual pages to be created dynamically. 


## Installation
With Bower:

    bower install swipe-pages

## Basic Example

    <swipe-pages>
      <swipe-page>I am page 0<swipe-page>
      <swipe-page>I am page 1<swipe-page>
      <swipe-page>I am page 2<swipe-page>
    </swipe-pages>

    
