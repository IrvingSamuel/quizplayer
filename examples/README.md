# Examples

| Example | Stack | Validation |
| --- | --- | --- |
| [vanilla-html](./vanilla-html) | `<script>` tag, no build step | client |
| [react-vite](./react-vite) | React 18 + Vite | client (or `endpoint`) |
| [vue-vite](./vue-vite) | Vue 3 + Vite | client (or `endpoint`) |
| [express](./express) | Node + Express | **server** |
| [nextjs](./nextjs) | Next.js App Router route handler | **server** |
| [go-nethttp](./go-nethttp) | Go `net/http` | **server** |
| [php-plain](./php-plain) | Plain PHP + PDO/SQLite | **server** |
| [laravel](./laravel) | Laravel + `<x-quizplayer>` Blade component | **server** |

Run them from a clone of the repository:

```bash
npm install && npm run build                       # JS packages
npm start -w examples/express                      # → http://localhost:3000
(cd examples/go-nethttp && go run .)               # → http://localhost:8080
composer install && php -S localhost:8000 -t examples/php-plain   # → http://localhost:8000
```
