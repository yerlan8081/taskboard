(()=>{var e={};e.id=856,e.ids=[856],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},1426:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>x,originalPathname:()=>u,pages:()=>c,routeModule:()=>p,tree:()=>d}),r(179),r(4752),r(5866);var s=r(3191),a=r(8716),i=r(7922),n=r.n(i),l=r(5231),o={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);r.d(t,o);let d=["",{children:["boards",{children:["[id]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,179)),"D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\boards\\[id]\\page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,4752)),"D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,5866,23)),"next/dist/client/components/not-found-error"]}],c=["D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\boards\\[id]\\page.tsx"],u="/boards/[id]/page",x={require:r,loadChunk:()=>Promise.resolve()},p=new s.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/boards/[id]/page",pathname:"/boards/[id]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},5873:(e,t,r)=>{Promise.resolve().then(r.bind(r,3229))},8539:(e,t,r)=>{Promise.resolve().then(r.bind(r,9083))},1961:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,2994,23)),Promise.resolve().then(r.t.bind(r,6114,23)),Promise.resolve().then(r.t.bind(r,9727,23)),Promise.resolve().then(r.t.bind(r,9671,23)),Promise.resolve().then(r.t.bind(r,1868,23)),Promise.resolve().then(r.t.bind(r,4759,23))},3229:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>N});var s=r(326),a=r(8571),i=r(1615),n=r(5826),l=r(9817),o=r(6126),d=r(208),c=r(6049),u=r(7267),x=r(5253),p=r(716),m=r(4251),b=r(8466),h=r(5047),g=r(434),v=r(7577),f=r(8977),y=r(5653);function N(){var e,t,r,N,j,k,w,P,_,E,C,D,I,T,S,R,M,$,L,A,q,B,U,F,G,O;let H=(0,h.useParams)(),Q=(0,h.useRouter)(),V=(0,v.useMemo)(()=>{let e=H?.id;return e?Array.isArray(e)?e[0]:e.toString():""},[H]),X=(0,a.x)(),z=(0,y.t)(e=>e.token);(0,y.t)(e=>e.setToken);let J=(0,y.t)(e=>e.clearAuth),[Y,W]=(0,v.useState)(""),[Z,K]=(0,v.useState)({}),[ee,et]=(0,v.useState)(null),[er,es]=(0,v.useState)(""),[ea,ei]=(0,v.useState)(1),[en,el]=(0,v.useState)(""),[eo,ed]=(0,v.useState)(""),[ec,eu]=(0,v.useState)(null),[ex,ep]=(0,v.useState)(!1),[em,eb]=(0,v.useState)(!1),{data:eh}=(0,i.aM)(f.Jn,{variables:{id:V},skip:!V||!z,onError:e=>{let t=e?.graphQLErrors?.[0]?.extensions?.code;"UNAUTHENTICATED"===t&&(J(),Q.replace("/login")),"FORBIDDEN"===t&&ep(!0)}}),{data:eg,loading:ev,refetch:ef}=(0,i.aM)(f.sY,{variables:{boardId:V},skip:!V||!z,onError:e=>{let t=e?.graphQLErrors?.[0]?.extensions?.code;"UNAUTHENTICATED"===t&&(J(),Q.replace("/login")),"FORBIDDEN"===t&&ep(!0),eu(e.message)}}),ey=(0,v.useCallback)(async e=>{K((await Promise.all(e.map(async e=>{let t=await X.query({query:f.XB,variables:{listId:e.id},fetchPolicy:"network-only"});return[e.id,t.data.tasks]}))).reduce((e,[t,r])=>(e[t]=r,e),{}))},[X]);e=f.$E,t={variables:{boardId:V},skip:!V||!z,onData:({data:e})=>{let t=e.data?.taskUpdated;t&&(et(`${t.type} ${t.task.title}`),K(e=>{let r;let s=t.task.listId,a=e[s]??[],i=a.findIndex(e=>e.id===t.task.id);return r=i>=0?[...a.slice(0,i),t.task,...a.slice(i+1)]:[...a,t.task],{...e,[s]:r}}))}},r=o.useRef(!1),N=(0,a.x)(t.client),(0,c.Vp)(e,c.n_.Subscription),!r.current&&(r.current=!0,t.onSubscriptionData&&!1!==globalThis.__DEV__&&l.kG.warn(t.onData?85:86),t.onSubscriptionComplete&&!1!==globalThis.__DEV__&&l.kG.warn(t.onComplete?87:88)),j=t.skip,k=t.fetchPolicy,w=t.errorPolicy,P=t.shouldResubscribe,_=t.context,E=t.extensions,C=t.ignoreResults,D=function(){return t.variables},I=[t.variables],(T=o.useRef(void 0)).current&&(0,d.D)(T.current.deps,I)||(T.current={value:D(),deps:I}),S=T.current.value,R=function(){var t,r,s;return t={query:e,variables:S,fetchPolicy:k,errorPolicy:w,context:_,extensions:E},r=(0,n.pi)((0,n.pi)({},t),{client:N,result:{loading:!0,data:void 0,error:void 0,variables:S},setResult:function(e){r.result=e}}),s=null,Object.assign(new x.y(function(e){s||(s=N.subscribe(t));var r=s.subscribe(e);return function(){return r.unsubscribe()}}),{__:r})},$=(M=o.useState(t.skip?null:R))[0],L=M[1],A=o.useRef(R),(0,m.L)(function(){A.current=R}),j?$&&L($=null):$&&(N===$.__.client&&e===$.__.query&&k===$.__.fetchPolicy&&w===$.__.errorPolicy&&(0,d.D)(S,$.__.variables)||("function"==typeof P?!!P(t):P)===!1)||L($=R()),q=o.useRef(t),o.useEffect(function(){q.current=t}),B=!j&&!C,U=o.useMemo(function(){return{loading:B,error:void 0,data:void 0,variables:S}},[B,S]),F=o.useRef(C),(0,m.L)(function(){F.current=C}),G=(0,p.$)(o.useCallback(function(e){if(!$)return function(){};var t=!1,r=$.__.variables,s=$.__.client,a=$.subscribe({next:function(a){if(!t){var n,l,o={loading:!1,data:a.data,error:(0,i.SU)(a),variables:r};$.__.setResult(o),F.current||e(),o.error?null===(l=(n=q.current).onError)||void 0===l||l.call(n,o.error):q.current.onData?q.current.onData({client:s,data:o}):q.current.onSubscriptionData&&q.current.onSubscriptionData({client:s,subscriptionData:o})}},error:function(s){var a,i;s=s instanceof u.cA?s:new u.cA({protocolErrors:[s]}),t||($.__.setResult({loading:!1,data:void 0,error:s,variables:r}),F.current||e(),null===(i=(a=q.current).onError)||void 0===i||i.call(a,s))},complete:function(){!t&&(q.current.onComplete?q.current.onComplete():q.current.onSubscriptionComplete&&q.current.onSubscriptionComplete())}});return function(){t=!0,setTimeout(function(){a.unsubscribe()})}},[$]),function(){return!$||j||C?U:$.__.result},function(){return U}),O=o.useCallback(function(){(0,l.kG)(!q.current.skip,89),L(A.current())},[q,A]),o.useMemo(function(){return(0,n.pi)((0,n.pi)({},G),{restart:O})},[G,O]);let[eN]=(0,b.D)(f.Z8,{onError:e=>{let t=e?.graphQLErrors?.[0]?.extensions?.code;"UNAUTHENTICATED"===t&&(J(),Q.replace("/login")),"FORBIDDEN"===t&&ep(!0)},onCompleted:e=>{let t=e?.updateTaskStatus;t&&K(e=>{let r=t.listId,s=e[r]??[],a=s.findIndex(e=>e.id===t.id);if(a>=0){let i=[...s];return i[a]={...s[a],...t},{...e,[r]:i}}return e})}}),[ej,{loading:ek}]=(0,b.D)(f.Bv,{onCompleted:async()=>{await ef(),es("")}}),[ew,{loading:eP}]=(0,b.D)(f.ew,{onCompleted:async()=>{el("")}}),e_=(0,v.useCallback)(async()=>{if(!V||!z)return;let e=await ef(),t=e.data?.lists??[];t.length>0?await ey(t):K({})},[V,ey,ef,z]),eE=async(e,t)=>{await eN({variables:{id:e,status:t}})},eC=async()=>{V&&er.trim()&&await ej({variables:{input:{boardId:V,title:er.trim(),order:Number(ea)||1}}})},eD=async()=>{if(!en.trim())return;let e=eo||eI[0]?.id;e&&await ew({variables:{input:{listId:e,title:en.trim()}}})},eI=eg?.lists??[];return z?(0,s.jsxs)("main",{className:"w-full max-w-4xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-8 shadow-2xl backdrop-blur",children:[(0,s.jsxs)("header",{className:"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",children:[(0,s.jsxs)("div",{children:[s.jsx("p",{className:"text-xs uppercase tracking-[0.35em] text-amber-300",children:"Board Detail"}),s.jsx("h1",{className:"text-3xl font-semibold text-white",children:Y||"Board"}),(0,s.jsxs)("p",{className:"text-xs text-slate-400 break-all",children:["ID: ",V]})]}),(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[s.jsx("button",{onClick:e_,className:"rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400",disabled:!z||!V,children:"Reload lists & tasks"}),s.jsx("button",{onClick:()=>{J(),Q.replace("/login")},className:"rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-200 hover:border-amber-400",children:"Logout"})]})]}),ex&&s.jsx("div",{className:"rounded-xl border border-red-500/40 bg-red-900/40 px-3 py-2 text-sm text-red-100",children:"You do not have access to this board (FORBIDDEN)."}),s.jsx("section",{className:"grid gap-4 sm:grid-cols-2",children:(0,s.jsxs)("div",{className:"space-y-2",children:[s.jsx("label",{className:"text-sm text-slate-300",children:"Subscription status"}),s.jsx("div",{className:"rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200",children:z&&V?"Listening for taskUpdated events...":"Disconnected"}),ee?(0,s.jsxs)("p",{className:"text-xs text-amber-300",children:["Last event: ",ee]}):s.jsx("p",{className:"text-xs text-slate-500",children:"Waiting for events"})]})}),(0,s.jsxs)("section",{className:"grid gap-4 sm:grid-cols-2",children:[(0,s.jsxs)("div",{className:"space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[s.jsx("p",{className:"text-sm font-semibold text-white",children:"Create List"}),s.jsx("button",{onClick:()=>eb(e=>!e),className:"text-xs text-amber-300 hover:text-amber-200",children:em?"Hide":"Show"})]}),em&&(0,s.jsxs)(s.Fragment,{children:[s.jsx("input",{value:er,onChange:e=>es(e.target.value),placeholder:"List title",className:"w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"}),s.jsx("input",{type:"number",value:ea,onChange:e=>ei(Number(e.target.value)),placeholder:"Order",className:"w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"}),s.jsx("button",{onClick:eC,disabled:ek,className:"w-full rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60",children:ek?"Creating...":"Create List"})]})]}),(0,s.jsxs)("div",{className:"space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[s.jsx("p",{className:"text-sm font-semibold text-white",children:"Create Task"}),s.jsx("button",{onClick:()=>eb(e=>!e),className:"text-xs text-amber-300 hover:text-amber-200",children:em?"Hide":"Show"})]}),em&&(0,s.jsxs)(s.Fragment,{children:[s.jsx("input",{value:en,onChange:e=>el(e.target.value),placeholder:"Task title",className:"w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"}),(0,s.jsxs)("select",{value:eo,onChange:e=>ed(e.target.value),className:"w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none",children:[s.jsx("option",{value:"",children:"Select list (or first)"}),eI.map(e=>s.jsx("option",{value:e.id,children:e.title},e.id))]}),s.jsx("button",{onClick:eD,disabled:eP||0===eI.length,className:"w-full rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60",children:eP?"Creating...":"Create Task"}),0===eI.length&&s.jsx("p",{className:"text-xs text-slate-500",children:"Create a list first."})]})]})]}),(0,s.jsxs)("section",{className:"space-y-3",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[s.jsx("h2",{className:"text-xl font-semibold text-white",children:"Lists"}),ev&&s.jsx("span",{className:"text-xs text-slate-400",children:"Loading lists..."})]}),0===eI.length?s.jsx("p",{className:"text-sm text-slate-400",children:"No lists yet. Create one via GraphQL and reload."}):s.jsx("div",{className:"grid gap-4 md:grid-cols-2",children:eI.slice().sort((e,t)=>e.order-t.order).map(e=>(0,s.jsxs)("div",{className:"rounded-2xl border border-white/10 bg-white/5 p-4",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[s.jsx("span",{className:"h-2 w-2 rounded-full bg-emerald-400"}),s.jsx("p",{className:"text-lg font-semibold text-white",children:e.title})]}),(0,s.jsxs)("span",{className:"text-xs text-slate-400",children:["#",e.order]})]}),(0,s.jsxs)("div",{className:"mt-3 space-y-2",children:[(Z[e.id]??[]).map(e=>(0,s.jsxs)("div",{className:"rounded-xl border border-white/5 bg-slate-800/60 px-3 py-2 text-sm text-white",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[s.jsx("span",{children:e.title}),s.jsx("span",{className:"rounded bg-slate-700 px-2 py-0.5 text-xs uppercase tracking-wide text-amber-200",children:e.status})]}),(0,s.jsxs)("p",{className:"text-xs text-slate-400",children:["Priority: ",e.priority]}),s.jsx("div",{className:"flex gap-2 text-xs",children:["TODO","DOING","DONE"].map(t=>s.jsx("button",{onClick:()=>eE(e.id,t),className:`rounded px-2 py-1 ${e.status===t?"bg-amber-500 text-slate-900":"bg-slate-700 text-slate-200"}`,children:t},t))}),e.tags.length>0&&(0,s.jsxs)("p",{className:"text-xs text-amber-200",children:["Tags: ",e.tags.join(", ")]})]},e.id)),0===(Z[e.id]??[]).length&&s.jsx("p",{className:"text-xs text-slate-500",children:"No tasks yet."})]})]},e.id))})]})]}):(0,s.jsxs)("main",{className:"w-full max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur",children:[s.jsx("p",{className:"text-sm text-slate-300",children:"Please login to view this board."}),s.jsx(g.default,{className:"text-amber-300 hover:text-amber-200",href:"/login",children:"Go to login"})]})}},9083:(e,t,r)=>{"use strict";r.d(t,{Providers:()=>u});var s=r(326),a=r(9592),i=r(7577),n=r(4179),l=r(8164),o=(r(4308),r(8325)),d=r(126),c=(r(8809),r(5653));function u({children:e}){let t=(0,c.t)(e=>e.token);(0,c.t)(e=>e.hydrateFromStorage),(0,c.t)(e=>e.hydrated);let r=(0,i.useMemo)(()=>(function(e){let t=process.env.NEXT_PUBLIC_GRAPHQL_HTTP||"http://localhost:4000/graphql";process.env.NEXT_PUBLIC_GRAPHQL_WS||t.replace(/^http/,"ws");let r=(0,n.L)({uri:t}),s=new l.i((t,r)=>(e&&t.setContext(({headers:t={}})=>({headers:{...t,Authorization:`Bearer ${e}`}})),r?r(t):null)).concat(r);return new o.f({link:s,cache:new d.h})})(t),[t]);return s.jsx(a.e,{client:r,children:e})}},8977:(e,t,r)=>{"use strict";r.d(t,{$E:()=>m,Bv:()=>u,Jn:()=>l,Nz:()=>i,V_:()=>c,XB:()=>d,Z8:()=>p,ew:()=>x,mL:()=>n,sY:()=>o,ym:()=>a});var s=r(4293);let a=(0,s.Ps)`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
        status
      }
    }
  }
`,i=(0,s.Ps)`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
        status
      }
    }
  }
`;(0,s.Ps)`
  query Me {
    me {
      id
      email
      name
      role
      status
    }
  }
`;let n=(0,s.Ps)`
  query Boards {
    boards {
      id
      title
      visibility
    }
  }
`,l=(0,s.Ps)`
  query Board($id: ID!) {
    board(id: $id) {
      id
      title
      visibility
      ownerId
    }
  }
`,o=(0,s.Ps)`
  query Lists($boardId: ID!) {
    lists(boardId: $boardId) {
      id
      title
      order
      color
    }
  }
`,d=(0,s.Ps)`
  query Tasks($listId: ID!) {
    tasks(listId: $listId) {
      id
      listId
      title
      description
      status
      priority
      tags
    }
  }
`;(0,s.Ps)`
  query Task($id: ID!) {
    task(id: $id) {
      id
      listId
      title
      description
      status
      priority
      tags
      assigneeId
      dueDate
    }
  }
`;let c=(0,s.Ps)`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      title
      visibility
    }
  }
`,u=(0,s.Ps)`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
      id
      title
      order
      boardId
    }
  }
`,x=(0,s.Ps)`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      listId
      status
      priority
      tags
    }
  }
`,p=(0,s.Ps)`
  mutation UpdateTaskStatus($id: ID!, $status: TaskStatus!) {
    updateTaskStatus(id: $id, status: $status) {
      id
      title
      listId
      status
      priority
      tags
    }
  }
`,m=(0,s.Ps)`
  subscription TaskUpdated($boardId: ID!) {
    taskUpdated(boardId: $boardId) {
      type
      task {
        id
        listId
        title
        status
        priority
        tags
      }
    }
  }
`},5047:(e,t,r)=>{"use strict";var s=r(7389);r.o(s,"useParams")&&r.d(t,{useParams:function(){return s.useParams}}),r.o(s,"useRouter")&&r.d(t,{useRouter:function(){return s.useRouter}})},5653:(e,t,r)=>{"use strict";r.d(t,{t:()=>s});let s=(0,r(114).Ue)(e=>({token:null,user:null,hydrated:!1,setToken:t=>{e({token:t})},setUser:t=>{e({user:t})},clearAuth:()=>{e({token:null,user:null})},hydrateFromStorage:()=>{}}))},179:(e,t,r)=>{"use strict";r.r(t),r.d(t,{$$typeof:()=>n,__esModule:()=>i,default:()=>l});var s=r(8570);let a=(0,s.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\boards\[id]\page.tsx`),{__esModule:i,$$typeof:n}=a;a.default;let l=(0,s.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\boards\[id]\page.tsx#default`)},4752:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>c,metadata:()=>d});var s=r(9510);r(7272);var a=r(8570);let i=(0,a.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\providers.tsx`),{__esModule:n,$$typeof:l}=i;i.default;let o=(0,a.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\providers.tsx#Providers`),d={title:"Taskboard",description:"Taskboard phase 0 skeleton"};function c({children:e}){return s.jsx("html",{lang:"en",children:s.jsx("body",{className:"min-h-screen",children:s.jsx(o,{children:s.jsx("div",{className:"flex min-h-screen items-center justify-center px-6 py-10",children:e})})})})}},7272:()=>{},4251:(e,t,r)=>{"use strict";r.d(t,{L:()=>a});var s=r(6126),a=r(1047).Nq?s.useLayoutEffect:s.useEffect},8466:(e,t,r)=>{"use strict";r.d(t,{D:()=>x});var s=r(5826),a=r(6126),i=r(4837),n=r(208),l=r(6049),o=r(7267),d=r(8571),c=r(4251),u=r(6127);function x(e,t){!1!==globalThis.__DEV__&&(0,u.G)(t||{},"ignoreResults","useMutation","If you don't want to synchronize component state with the mutation, please use the `useApolloClient` hook to get the client instance and call `client.mutate` directly.");var r=(0,d.x)(null==t?void 0:t.client);(0,l.Vp)(e,l.n_.Mutation);var x=a.useState({called:!1,loading:!1,client:r}),p=x[0],m=x[1],b=a.useRef({result:p,mutationId:0,isMounted:!0,client:r,mutation:e,options:t});(0,c.L)(function(){Object.assign(b.current,{client:r,options:t,mutation:e})});var h=a.useCallback(function(e){void 0===e&&(e={});var t=b.current,r=t.options,a=t.mutation,l=(0,s.pi)((0,s.pi)({},r),{mutation:a}),d=e.client||b.current.client;b.current.result.loading||l.ignoreResults||!b.current.isMounted||m(b.current.result={loading:!0,error:void 0,data:void 0,called:!0,client:d});var c=++b.current.mutationId,u=(0,i.J)(l,e);return d.mutate(u).then(function(t){var r,s,a=t.data,i=t.errors,l=i&&i.length>0?new o.cA({graphQLErrors:i}):void 0,x=e.onError||(null===(r=b.current.options)||void 0===r?void 0:r.onError);if(l&&x&&x(l,u),c===b.current.mutationId&&!u.ignoreResults){var p={called:!0,loading:!1,data:a,error:l,client:d};b.current.isMounted&&!(0,n.D)(b.current.result,p)&&m(b.current.result=p)}var h=e.onCompleted||(null===(s=b.current.options)||void 0===s?void 0:s.onCompleted);return l||null==h||h(t.data,u),t},function(t){if(c===b.current.mutationId&&b.current.isMounted){var r,s={loading:!1,error:t,data:void 0,called:!0,client:d};(0,n.D)(b.current.result,s)||m(b.current.result=s)}var a=e.onError||(null===(r=b.current.options)||void 0===r?void 0:r.onError);if(a)return a(t,u),{data:void 0,errors:t};throw t})},[]),g=a.useCallback(function(){if(b.current.isMounted){var e={called:!1,loading:!1,client:b.current.client};Object.assign(b.current,{mutationId:0,result:e}),m(e)}},[]);return a.useEffect(function(){var e=b.current;return e.isMounted=!0,function(){e.isMounted=!1}},[]),[h,(0,s.pi)({reset:g},p)]}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[708,251,615],()=>r(1426));module.exports=s})();