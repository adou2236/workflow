import startEvent from './startEvent.vue';
import Task from './task.vue';
import subProcess from './subProcess.vue';

export default {
  'bpmn:startEvent': startEvent,
  'bpmn:timerEventDefinition': startEvent,
  'bpmn:endEvent': startEvent,
  'bpmn:userTask': Task,
  'bpmn:serviceTask': Task,
  'bpmn:exclusiveGateway': startEvent,
  'bpmn:inclusiveGateway': startEvent,
  'bpmn:parallelGateway': startEvent,
  'bpmn:subProcess': subProcess,
};
