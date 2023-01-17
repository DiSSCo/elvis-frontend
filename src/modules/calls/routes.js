import Calls from './Calls.vue';
import Call from './Call.vue';
import EditCall from './EditCall.vue';
import NewCall from './NewCall.vue';

const callsRoutes = [
  {
    path: '/calls',
    name: 'calls',
    component: Calls,
  },
  {
    path: '/calls/call/:id',
    name: 'call-details',
    component: Call,
  },
  {
    path: '/calls/call/:id/edit-call',
    name: 'edit-call',
    component: EditCall,
  },
  {
    path: '/calls/new-call',
    name: 'new-call',
    component: NewCall,
  },
];

export default callsRoutes;
