import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

// Svelte 5 uses the mount API
mount(App, {
  target: document.getElementById('app')!
});
