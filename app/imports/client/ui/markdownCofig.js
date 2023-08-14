import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  breaks: true,
  gfm: true,
  silent: true,
  smartLists: true,
  smartypants: true,
  //baseUrl: 'https://dicecloud.com',
});
