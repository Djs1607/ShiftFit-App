Bottom nav for the app's four destinations. Active = amber icon + semibold label; no pill, no indicator bar.

```jsx
<TabBar active="today" onChange={setTab} items={[
  {id:'today',label:'Today',icon:'activity'},
  {id:'train',label:'Train',icon:'dumbbell'},
  {id:'recover',label:'Recover',icon:'moon'},
  {id:'you',label:'You',icon:'user'}]} />
```
