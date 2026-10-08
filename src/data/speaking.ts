import type { ActivityType } from '../types'

export const speakingTrainingSteps:Array<{id:'listen'|'repeat'|'recall'|'respond';label:string;activityType:ActivityType;showsEnglish:boolean}>=[
  {id:'listen',label:'Listen',activityType:'listening',showsEnglish:false},
  {id:'repeat',label:'Repeat',activityType:'speaking_repeat',showsEnglish:true},
  {id:'recall',label:'Recall',activityType:'speaking_recall',showsEnglish:false},
  {id:'respond',label:'Respond',activityType:'speaking_respond',showsEnglish:false}
]
