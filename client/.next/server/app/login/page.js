(()=>{var e={};e.id=626,e.ids=[626],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},8919:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>i.a,__next_app__:()=>p,originalPathname:()=>c,pages:()=>u,routeModule:()=>m,tree:()=>d}),r(4687),r(4752),r(5866);var s=r(3191),a=r(8716),n=r(7922),i=r.n(n),o=r(5231),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);r.d(t,l);let d=["",{children:["login",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,4687)),"D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\login\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,4752)),"D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,5866,23)),"next/dist/client/components/not-found-error"]}],u=["D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\login\\page.tsx"],c="/login/page",p={require:r,loadChunk:()=>Promise.resolve()},m=new s.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/login/page",pathname:"/login",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},8539:(e,t,r)=>{Promise.resolve().then(r.bind(r,9083))},7171:(e,t,r)=>{Promise.resolve().then(r.bind(r,1442))},1961:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,2994,23)),Promise.resolve().then(r.t.bind(r,6114,23)),Promise.resolve().then(r.t.bind(r,9727,23)),Promise.resolve().then(r.t.bind(r,9671,23)),Promise.resolve().then(r.t.bind(r,1868,23)),Promise.resolve().then(r.t.bind(r,4759,23))},1442:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>u});var s=r(326),a=r(8466),n=r(5047),i=r(7577),o=r(434),l=r(5653),d=r(8977);function u(){let e=(0,n.useRouter)(),t=(0,l.t)(e=>e.setToken),r=(0,l.t)(e=>e.setUser),[u,c]=(0,i.useState)("owner@test.com"),[p,m]=(0,i.useState)("Passw0rd!"),[x,h]=(0,i.useState)(null),[b,{loading:g}]=(0,a.D)(d.ym,{onCompleted:s=>{let a=s?.login?.token,n=s?.login?.user;a&&(t(a),r(n),e.push("/boards"))},onError:e=>{h(e.message)}});return(0,s.jsxs)("main",{className:"w-full max-w-xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur",children:[(0,s.jsxs)("header",{className:"space-y-2",children:[s.jsx("p",{className:"text-xs uppercase tracking-[0.35em] text-amber-300",children:"Taskboard"}),s.jsx("h1",{className:"text-3xl font-semibold text-white",children:"Login"}),s.jsx("p",{className:"text-sm text-slate-400",children:"Use your account to access boards."})]}),(0,s.jsxs)("form",{onSubmit:e=>{if(e.preventDefault(),!u.includes("@")){h("Please enter a valid email");return}if(!p){h("Password cannot be empty");return}h(null),b({variables:{input:{email:u.trim(),password:p}}})},className:"space-y-4",children:[(0,s.jsxs)("div",{className:"space-y-2",children:[s.jsx("label",{className:"text-sm text-slate-300",children:"Email"}),s.jsx("input",{value:u,onChange:e=>c(e.target.value),className:"w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-amber-400 focus:outline-none",type:"email",placeholder:"you@example.com",required:!0})]}),(0,s.jsxs)("div",{className:"space-y-2",children:[s.jsx("label",{className:"text-sm text-slate-300",children:"Password"}),s.jsx("input",{value:p,onChange:e=>m(e.target.value),className:"w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-amber-400 focus:outline-none",type:"password",placeholder:"********",required:!0})]}),x&&s.jsx("p",{className:"text-sm text-red-300",children:x}),s.jsx("button",{type:"submit",disabled:g,className:"w-full rounded-xl bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60",children:g?"Logging in...":"Login"})]}),(0,s.jsxs)("div",{className:"text-sm text-slate-400",children:[s.jsx(o.default,{href:"/boards",className:"text-amber-300 hover:text-amber-200",children:"Go to boards"}),s.jsx("div",{className:"mt-2",children:s.jsx(o.default,{href:"/register",className:"text-amber-300 hover:text-amber-200",children:"No account? Register"})})]})]})}},9083:(e,t,r)=>{"use strict";r.d(t,{Providers:()=>c});var s=r(326),a=r(9592),n=r(7577),i=r(4179),o=r(8164),l=(r(4308),r(8325)),d=r(126),u=(r(8809),r(5653));function c({children:e}){let t=(0,u.t)(e=>e.token);(0,u.t)(e=>e.hydrateFromStorage),(0,u.t)(e=>e.hydrated);let r=(0,n.useMemo)(()=>(function(e){let t=process.env.NEXT_PUBLIC_GRAPHQL_HTTP||"http://localhost:4000/graphql";process.env.NEXT_PUBLIC_GRAPHQL_WS||t.replace(/^http/,"ws");let r=(0,i.L)({uri:t}),s=new o.i((t,r)=>(e&&t.setContext(({headers:t={}})=>({headers:{...t,Authorization:`Bearer ${e}`}})),r?r(t):null)).concat(r);return new l.f({link:s,cache:new d.h})})(t),[t]);return s.jsx(a.e,{client:r,children:e})}},8977:(e,t,r)=>{"use strict";r.d(t,{$E:()=>x,Bv:()=>c,Jn:()=>o,Nz:()=>n,V_:()=>u,XB:()=>d,Z8:()=>m,ew:()=>p,mL:()=>i,sY:()=>l,ym:()=>a});var s=r(4293);let a=(0,s.Ps)`
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
`,n=(0,s.Ps)`
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
`;let i=(0,s.Ps)`
  query Boards {
    boards {
      id
      title
      visibility
    }
  }
`,o=(0,s.Ps)`
  query Board($id: ID!) {
    board(id: $id) {
      id
      title
      visibility
      ownerId
    }
  }
`,l=(0,s.Ps)`
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
`;let u=(0,s.Ps)`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      title
      visibility
    }
  }
`,c=(0,s.Ps)`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
      id
      title
      order
      boardId
    }
  }
`,p=(0,s.Ps)`
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
`,m=(0,s.Ps)`
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
`,x=(0,s.Ps)`
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
`},5047:(e,t,r)=>{"use strict";var s=r(7389);r.o(s,"useParams")&&r.d(t,{useParams:function(){return s.useParams}}),r.o(s,"useRouter")&&r.d(t,{useRouter:function(){return s.useRouter}})},5653:(e,t,r)=>{"use strict";r.d(t,{t:()=>s});let s=(0,r(114).Ue)(e=>({token:null,user:null,hydrated:!1,setToken:t=>{e({token:t})},setUser:t=>{e({user:t})},clearAuth:()=>{e({token:null,user:null})},hydrateFromStorage:()=>{}}))},4752:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>u,metadata:()=>d});var s=r(9510);r(7272);var a=r(8570);let n=(0,a.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\providers.tsx`),{__esModule:i,$$typeof:o}=n;n.default;let l=(0,a.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\providers.tsx#Providers`),d={title:"Taskboard",description:"Taskboard phase 0 skeleton"};function u({children:e}){return s.jsx("html",{lang:"en",children:s.jsx("body",{className:"min-h-screen",children:s.jsx(l,{children:s.jsx("div",{className:"flex min-h-screen items-center justify-center px-6 py-10",children:e})})})})}},4687:(e,t,r)=>{"use strict";r.r(t),r.d(t,{$$typeof:()=>i,__esModule:()=>n,default:()=>o});var s=r(8570);let a=(0,s.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\login\page.tsx`),{__esModule:n,$$typeof:i}=a;a.default;let o=(0,s.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\login\page.tsx#default`)},7272:()=>{},4251:(e,t,r)=>{"use strict";r.d(t,{L:()=>a});var s=r(6126),a=r(1047).Nq?s.useLayoutEffect:s.useEffect},8466:(e,t,r)=>{"use strict";r.d(t,{D:()=>p});var s=r(5826),a=r(6126),n=r(4837),i=r(208),o=r(6049),l=r(7267),d=r(8571),u=r(4251),c=r(6127);function p(e,t){!1!==globalThis.__DEV__&&(0,c.G)(t||{},"ignoreResults","useMutation","If you don't want to synchronize component state with the mutation, please use the `useApolloClient` hook to get the client instance and call `client.mutate` directly.");var r=(0,d.x)(null==t?void 0:t.client);(0,o.Vp)(e,o.n_.Mutation);var p=a.useState({called:!1,loading:!1,client:r}),m=p[0],x=p[1],h=a.useRef({result:m,mutationId:0,isMounted:!0,client:r,mutation:e,options:t});(0,u.L)(function(){Object.assign(h.current,{client:r,options:t,mutation:e})});var b=a.useCallback(function(e){void 0===e&&(e={});var t=h.current,r=t.options,a=t.mutation,o=(0,s.pi)((0,s.pi)({},r),{mutation:a}),d=e.client||h.current.client;h.current.result.loading||o.ignoreResults||!h.current.isMounted||x(h.current.result={loading:!0,error:void 0,data:void 0,called:!0,client:d});var u=++h.current.mutationId,c=(0,n.J)(o,e);return d.mutate(c).then(function(t){var r,s,a=t.data,n=t.errors,o=n&&n.length>0?new l.cA({graphQLErrors:n}):void 0,p=e.onError||(null===(r=h.current.options)||void 0===r?void 0:r.onError);if(o&&p&&p(o,c),u===h.current.mutationId&&!c.ignoreResults){var m={called:!0,loading:!1,data:a,error:o,client:d};h.current.isMounted&&!(0,i.D)(h.current.result,m)&&x(h.current.result=m)}var b=e.onCompleted||(null===(s=h.current.options)||void 0===s?void 0:s.onCompleted);return o||null==b||b(t.data,c),t},function(t){if(u===h.current.mutationId&&h.current.isMounted){var r,s={loading:!1,error:t,data:void 0,called:!0,client:d};(0,i.D)(h.current.result,s)||x(h.current.result=s)}var a=e.onError||(null===(r=h.current.options)||void 0===r?void 0:r.onError);if(a)return a(t,c),{data:void 0,errors:t};throw t})},[]),g=a.useCallback(function(){if(h.current.isMounted){var e={called:!1,loading:!1,client:h.current.client};Object.assign(h.current,{mutationId:0,result:e}),x(e)}},[]);return a.useEffect(function(){var e=h.current;return e.isMounted=!0,function(){e.isMounted=!1}},[]),[b,(0,s.pi)({reset:g},m)]}}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[708,251],()=>r(8919));module.exports=s})();