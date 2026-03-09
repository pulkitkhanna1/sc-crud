import { useState, useMemo } from "react";

const C = {bg:"#0f0f13",surface:"#16161e",surface2:"#1e1e2e",border:"#2a2a3a",accent:"#7c3aed",accent2:"#2563eb",text:"#e2e2f0",muted:"#888",success:"#22c55e",warning:"#f59e0b",danger:"#ef4444",info:"#38bdf8",teal:"#0d9488"};

const STATUSES = ["Assigned to Writer","Completed by Writer","Ready for Production","Rewrite Required"];
const STATUS_COLOR = {"Assigned to Writer":C.info,"Completed by Writer":C.warning,"Ready for Production":C.success,"Rewrite Required":C.danger};
const GRADES = ["Strong Output – Minor Touchups Required","Minor Flaws – Pacing / Opening Idea","Major Flaws – Structural / Tonal / Logical","Redo"];
const GRADE_COLOR = {"Strong Output – Minor Touchups Required":C.success,"Minor Flaws – Pacing / Opening Idea":C.warning,"Major Flaws – Structural / Tonal / Logical":"#f97316","Redo":C.danger};
const GRADE_SHORT = {"Strong Output – Minor Touchups Required":"Strong","Minor Flaws – Pacing / Opening Idea":"Minor Flaws","Major Flaws – Structural / Tonal / Logical":"Major Flaws","Redo":"Redo"};
const SHOWS = ["MVS","FLBM","WBT"];
const PROD_TYPES = [{label:"Q1+TN",suffix:"GA"},{label:"Full Gen AI",suffix:"GU"}];
const IDEA_STATUSES = ["Not Reviewed","Accepted","Rejected"];
const IDEA_STATUS_COLOR = {"Not Reviewed":C.muted,"Accepted":C.success,"Rejected":C.danger};
const BEATS_STATUSES = ["Assigned","Submitted","Approved for Script Writing","To be Redone"];
const BEATS_STATUS_COLOR = {"Assigned":C.info,"Submitted":C.warning,"Approved for Script Writing":C.success,"To be Redone":C.danger};
const BEAT_FIELDS = [{key:"setting",label:"Setting"},{key:"opening",label:"Opening"},{key:"tickingClock",label:"Ticking Clock"},{key:"stakes",label:"Stakes"},{key:"goal",label:"Goal"},{key:"cliffhanger",label:"Cliffhanger"},{key:"note",label:"Note"}];
const IDEA_FIELDS = BEAT_FIELDS;

const ALL_PEOPLE = ["Aakash Ahuja","Ari Jacobson","Carolina Munhoz","Cory David Crouser","Dan Woodward","Jacob Berman","Jasper Chen","Joe Osborn","Jonathan Hernandez","Joshua Roth","Krystle Drew","Lux Saxena","Micah McFarland","Michael Ouzas","Miguel Silan","Minoti Vaishnav","Nandita Seshadri","Nishant Gilatar","Paul Lee","Pranav Patki","Will Morgan","William Heus","Yadhu Gopal"];
const INIT_WRITERS = ["Ari Jacobson","Carolina Munhoz","Cory David Crouser","Jasper Chen","Joe Osborn","Jonathan Hernandez","Krystle Drew","Micah McFarland","Michael Ouzas","Miguel Silan","Minoti Vaishnav","Nandita Seshadri","Will Morgan","William Heus"];
const INIT_PODS = ["Dan Woodward","Joshua Roth","Nishant Gilatar","Paul Lee"];
const INIT_BIZ = ["Aakash Ahuja","Jacob Berman","Lux Saxena","Pranav Patki","Yadhu Gopal"];

const padI = n=>"I"+String(n).padStart(4,"0");
const padB = n=>"B"+String(n).padStart(4,"0");
const padA = n=>String(n).padStart(5,"0");
const today = ()=>new Date().toISOString().split("T")[0];
const tsNow = ()=>new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});
const emptyBeatForm = ()=>({title:"",setting:"",opening:"",tickingClock:"",stakes:"",goal:"",cliffhanger:"",note:"",docLink:"",assignedTo:"",assignedRole:"Writer",requestRaisedOn:today(),expectedStartDate:"",expectedCompleteDate:""});

const inp  = (ex={})=>({background:"#0f0f13",border:"1px solid #3a3a4a",borderRadius:8,color:C.text,padding:"8px 12px",fontSize:14,outline:"none",width:"100%",boxSizing:"border-box",...ex});
const sel  = (ex={})=>({...inp(),cursor:"pointer",...ex});
const btn  = (bg,ex={})=>({background:bg,border:"none",borderRadius:8,color:"#fff",padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13,...ex});
const card = (ex={})=>({background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,...ex});

const Lbl  = ({c})=><label style={{fontSize:11,color:C.muted,fontWeight:600,display:"block",marginBottom:5,letterSpacing:.6}}>{c}</label>;
const Badge= ({status,colorMap})=>{ const cm=colorMap||STATUS_COLOR; const color=cm[status]||C.muted; return <span style={{background:color+"22",color,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{status}</span>; };
const TsRow= ({label,value})=>{ if(!value) return null; return <div style={{display:"flex",gap:8,fontSize:12}}><span style={{color:C.muted,minWidth:200}}>{label}</span><span style={{fontWeight:500}}>{value}</span></div>; };

function Modal({title,onClose,children,wide=false}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:24,width:"100%",maxWidth:wide?760:520,maxHeight:"93vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:16}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── MOCK DATA ──────────────────────────────────────────────
const MOCK_IDEAS = [
  {id:"I0001",show:"MVS",angle:"Why Sleep Deprivation Is the Silent Productivity Killer",submittedBy:"Jonathan Hernandez",submittedOn:"2026-01-05",status:"Accepted",setting:"Corporate workplace",opening:"We treat sleep as optional but science says otherwise",tickingClock:"Every bad night compounds cognitive debt silently",stakes:"Performance, decision quality, long-term health",goal:"Connect sleep science to measurable workplace output",cliffhanger:"What if sleep is the most neglected productivity lever?",note:"NA"},
  {id:"I0002",show:"FLBM",angle:"The Hidden Cost of Always Being Available",submittedBy:"Nandita Seshadri",submittedOn:"2026-01-06",status:"Accepted",setting:"Always-on remote work culture",opening:"The notification that never stops is rewiring your brain",tickingClock:"Burnout rates are doubling year over year",stakes:"Mental health, retention, creative output",goal:"Quantify the true cost of constant availability",cliffhanger:"What if being less available made you more effective?",note:"NA"},
  {id:"I0003",show:"WBT",angle:"Decision Fatigue: Why Leaders Make Worse Choices After Noon",submittedBy:"Dan Woodward",submittedOn:"2026-01-07",status:"Not Reviewed",setting:"NA",opening:"NA",tickingClock:"NA",stakes:"NA",goal:"NA",cliffhanger:"NA",note:"NA"},
  {id:"I0004",show:"MVS",angle:"How Micro-Habits Compound Into Major Behavioral Shifts",submittedBy:"Ari Jacobson",submittedOn:"2026-01-08",status:"Not Reviewed",setting:"NA",opening:"NA",tickingClock:"NA",stakes:"NA",goal:"NA",cliffhanger:"NA",note:"NA"},
  {id:"I0005",show:"FLBM",angle:"The Science of First Impressions in Professional Settings",submittedBy:"Krystle Drew",submittedOn:"2026-01-09",status:"Not Reviewed",setting:"NA",opening:"NA",tickingClock:"NA",stakes:"NA",goal:"NA",cliffhanger:"NA",note:"NA"},
  {id:"I0006",show:"WBT",angle:"What Cold Water Swimming Teaches Us About Stress Tolerance",submittedBy:"Miguel Silan",submittedOn:"2026-01-10",status:"Accepted",setting:"Biohacking and wellness space",opening:"Your body has a built-in stress reset — most people never use it",tickingClock:"Chronic stress is eroding nervous system resilience daily",stakes:"Mental resilience, physical recovery, stress response",goal:"Make cold exposure accessible and scientifically grounded",cliffhanger:"Could 3 minutes change your entire stress response?",note:"NA"},
  {id:"I0007",show:"MVS",angle:"Reading Between the Lines: What Body Language Reveals in Negotiation",submittedBy:"Paul Lee",submittedOn:"2026-01-11",status:"Not Reviewed",setting:"NA",opening:"NA",tickingClock:"NA",stakes:"NA",goal:"NA",cliffhanger:"NA",note:"NA"},
  {id:"I0008",show:"FLBM",angle:"The Myth of the 10,000 Hour Rule Revisited",submittedBy:"Jasper Chen",submittedOn:"2026-01-12",status:"Rejected",setting:"Skill development and mastery",opening:"You've been told 10,000 hours makes you an expert — that's only half the story",tickingClock:"People are investing years in the wrong kind of practice",stakes:"Career trajectory, competitive edge, time investment",goal:"Reframe deliberate practice vs repetition with evidence",cliffhanger:"Are you practicing — or just putting in time?",note:"Revisit framing"},
  {id:"I0009",show:"WBT",angle:"Why Your Morning Routine Might Be Working Against You",submittedBy:"Minoti Vaishnav",submittedOn:"2026-01-13",status:"Not Reviewed",setting:"NA",opening:"NA",tickingClock:"NA",stakes:"NA",goal:"NA",cliffhanger:"NA",note:"NA"},
  {id:"I0010",show:"MVS",angle:"The Neuroscience of Storytelling and Why It Drives Action",submittedBy:"Joshua Roth",submittedOn:"2026-01-14",status:"Accepted",setting:"Neuroscience meets communication strategy",opening:"The stories that move people aren't random — they're engineered",tickingClock:"In the attention economy forgettable content is wasted",stakes:"Influence, brand memory, audience retention",goal:"Map narrative structure to emotional memory formation",cliffhanger:"What's the story your audience remembers in 10 years?",note:"NA"},
];

const MOCK_BEATS = [
  {id:"B0001",ideaId:"I0001",title:"Sleep & Cortisol — The Performance Link",setting:"Corporate office",opening:"Most people treat sleep as optional — their cortisol tells a different story",tickingClock:"Every poor night compounds measurable performance loss",stakes:"Decision quality, focus, emotional regulation",goal:"Connect sleep science to workplace productivity",cliffhanger:"What if sleep is your biggest untapped productivity hack?",note:"NA",docLink:"https://docs.google.com/mock-b1",assignedTo:"Jonathan Hernandez",assignedRole:"Writer",requestRaisedOn:"2026-01-10",expectedStartDate:"2026-01-11",expectedCompleteDate:"2026-01-14",status:"Approved for Script Writing",submittedOn:"2026-01-13",reviewedBy:"Dan Woodward",reviewedOn:"2026-01-14",reviewNotes:""},
  {id:"B0002",ideaId:"I0001",title:"Sleep Debt and Decision Making",setting:"High-stakes decisions",opening:"Every sleepless night costs you more than energy",tickingClock:"Sleep debt compounds 30% faster than most realise",stakes:"Strategic decisions, team morale, personal health",goal:"Quantify the decision-making cost of sleep deprivation",cliffhanger:"How many wrong calls have you made sleep-deprived?",note:"NA",docLink:"https://docs.google.com/mock-b2",assignedTo:"Ari Jacobson",assignedRole:"Writer",requestRaisedOn:"2026-01-10",expectedStartDate:"2026-01-12",expectedCompleteDate:"2026-01-14",status:"Approved for Script Writing",submittedOn:"2026-01-13",reviewedBy:"Dan Woodward",reviewedOn:"2026-01-14",reviewNotes:""},
  {id:"B0003",ideaId:"I0002",title:"Always-On Culture and Burnout",setting:"Remote/hybrid work",opening:"The notification that never stops is rewiring your brain",tickingClock:"Burnout rates are doubling year over year",stakes:"Mental health, team retention, creative output",goal:"Connect always-on culture to measurable burnout",cliffhanger:"What if you turned off notifications for 72 hours?",note:"NA",docLink:"https://docs.google.com/mock-b3",assignedTo:"Nandita Seshadri",assignedRole:"Writer",requestRaisedOn:"2026-01-11",expectedStartDate:"2026-01-12",expectedCompleteDate:"2026-01-15",status:"Approved for Script Writing",submittedOn:"2026-01-14",reviewedBy:"Joshua Roth",reviewedOn:"2026-01-15",reviewNotes:""},
  {id:"B0004",ideaId:"I0006",title:"Cold Exposure and the Nervous System",setting:"Biohacking / wellness",opening:"Your body has a built-in stress reset button",tickingClock:"Chronic stress is degrading nervous system resilience daily",stakes:"Mental resilience, physical recovery, stress response",goal:"Explain cold exposure's effect on the vagus nerve",cliffhanger:"Could 3 minutes of cold water change your stress response?",note:"NA",docLink:"",assignedTo:"Miguel Silan",assignedRole:"Writer",requestRaisedOn:"2026-01-13",expectedStartDate:"2026-01-15",expectedCompleteDate:"2026-01-20",status:"Submitted",submittedOn:"2026-01-19",reviewedBy:"",reviewedOn:"",reviewNotes:""},
  {id:"B0005",ideaId:"I0006",title:"Voluntary Discomfort as a Resilience Tool",setting:"Personal development",opening:"Comfort is the enemy of growth — but how do you train discomfort?",tickingClock:"Every avoided challenge makes the next one harder",stakes:"Mental toughness, grit, long-term resilience",goal:"Build the case for voluntary discomfort as deliberate practice",cliffhanger:"What's the one uncomfortable thing you've been avoiding?",note:"NA",docLink:"https://docs.google.com/mock-b5",assignedTo:"Will Morgan",assignedRole:"Writer",requestRaisedOn:"2026-01-13",expectedStartDate:"2026-01-15",expectedCompleteDate:"2026-01-20",status:"Approved for Script Writing",submittedOn:"2026-01-18",reviewedBy:"Paul Lee",reviewedOn:"2026-01-20",reviewNotes:""},
  {id:"B0006",ideaId:"I0010",title:"Story Structure and Emotional Memory",setting:"Neuroscience / communication",opening:"The stories that stay aren't random — they're engineered",tickingClock:"In the attention economy forgettable content is wasted",stakes:"Influence, retention, brand memory",goal:"Map narrative structure to emotional memory formation",cliffhanger:"What's the story your audience remembers in 10 years?",note:"NA",docLink:"https://docs.google.com/mock-b6",assignedTo:"Jasper Chen",assignedRole:"Writer",requestRaisedOn:"2026-01-14",expectedStartDate:"2026-01-16",expectedCompleteDate:"2026-01-21",status:"Approved for Script Writing",submittedOn:"2026-01-20",reviewedBy:"Joshua Roth",reviewedOn:"2026-01-21",reviewNotes:""},
  {id:"B0007",ideaId:"I0004",title:"Habit Stacking for Behavioral Change",setting:"Behavioral psychology",opening:"You don't build habits — you stack them",tickingClock:"Every day without a system is lost momentum",stakes:"Long-term behavior change, personal effectiveness",goal:"Explain habit stacking with practical examples",cliffhanger:"What's the one habit that could unlock five others?",note:"NA",docLink:"",assignedTo:"Micah McFarland",assignedRole:"Writer",requestRaisedOn:"2026-01-15",expectedStartDate:"2026-01-18",expectedCompleteDate:"2026-01-24",status:"Assigned",submittedOn:"",reviewedBy:"",reviewedOn:"",reviewNotes:""},
  {id:"B0008",ideaId:"I0008",title:"Deliberate Practice vs Repetition",setting:"Skill development",opening:"Repetition doesn't make you better — deliberate practice does",tickingClock:"Most people plateau because they confuse volume with progress",stakes:"Career growth, skill mastery, competitive advantage",goal:"Distinguish deliberate practice from mere repetition",cliffhanger:"Are you practicing — or just going through the motions?",note:"NA",docLink:"",assignedTo:"Carolina Munhoz",assignedRole:"Writer",requestRaisedOn:"2026-01-16",expectedStartDate:"2026-01-20",expectedCompleteDate:"2026-01-27",status:"To be Redone",submittedOn:"2026-01-24",reviewedBy:"Dan Woodward",reviewedOn:"2026-01-25",reviewNotes:"Opening angle needs more punch. Ticking clock is too generic."},
];

const MOCK_ENTRIES = [
  {id:1,assignmentType:"new",beatId:"B0001",code:"GA00001",editCode:"GA1001",show:"MVS",angle:"Sleep & Cortisol — The Performance Link",writer:"Jonathan Hernandez",podLead:"Dan Woodward",dateAssigned:"2026-01-10",dateDue:"2026-01-17",notes:"Focus on the opening hook.",status:"Ready for Production",submission:"Draft with strong narrative arc.",grade:"Strong Output – Minor Touchups Required",feedback:"Tighten the final paragraph.",finalOutput:"Polished version with tightened conclusion.",prodSuffix:"GA",tsSubmitted:"Jan 14, 2026, 10:22 AM",tsReviewed:"Jan 16, 2026, 03:45 PM",tsProduction:"Jan 16, 2026, 03:45 PM",parentCode:null,codeToRework:"",updatedBeats:""},
  {id:2,assignmentType:"new",beatId:"B0003",code:"GU00002",editCode:"GU2034",show:"FLBM",angle:"Always-On Culture and Burnout",writer:"Nandita Seshadri",podLead:"Joshua Roth",dateAssigned:"2026-01-11",dateDue:"2026-01-18",notes:"Conversational tone, not academic.",status:"Ready for Production",submission:"Well-paced piece with strong voice.",grade:"Strong Output – Minor Touchups Required",feedback:"Solid. Minor wording edits applied.",finalOutput:"Final version with two minor phrasing adjustments.",prodSuffix:"GU",tsSubmitted:"Jan 15, 2026, 09:10 AM",tsReviewed:"Jan 17, 2026, 11:30 AM",tsProduction:"Jan 17, 2026, 11:30 AM",parentCode:null,codeToRework:"",updatedBeats:""},
  {id:3,assignmentType:"improvement",beatId:null,code:"00003",editCode:"GA4422",show:"WBT",angle:"Decision Fatigue — Second Pass",writer:"Miguel Silan",podLead:"Paul Lee",dateAssigned:"2026-01-12",dateDue:"2026-01-20",notes:"Ensure logical flow between beats 2 and 3.",status:"Rewrite Required",submission:"Draft with structural issues in middle section.",grade:"Major Flaws – Structural / Tonal / Logical",feedback:"The transition between conflict and resolution needs a full rework.",finalOutput:"Reviewed version with comments inline.",prodSuffix:"",tsSubmitted:"Jan 18, 2026, 02:15 PM",tsReviewed:"Jan 20, 2026, 04:00 PM",tsProduction:null,parentCode:null,codeToRework:"GA3300",updatedBeats:"https://docs.google.com/mock-update1"},
  {id:4,assignmentType:"new",beatId:"B0005",code:"00004",editCode:"GU8801",show:"WBT",angle:"Voluntary Discomfort as a Resilience Tool",writer:"Will Morgan",podLead:"Nishant Gilatar",dateAssigned:"2026-01-13",dateDue:"2026-01-21",notes:"Opening idea must be punchy.",status:"Assigned to Writer",submission:"",grade:"",feedback:"",finalOutput:"",prodSuffix:"",tsSubmitted:null,tsReviewed:null,tsProduction:null,parentCode:null,codeToRework:"",updatedBeats:""},
  {id:5,assignmentType:"new",beatId:"B0002",code:"GU00005",editCode:"GU3310",show:"MVS",angle:"Sleep Debt and Decision Making",writer:"Ari Jacobson",podLead:"Dan Woodward",dateAssigned:"2026-01-14",dateDue:"2026-01-22",notes:"Balance humor with information.",status:"Ready for Production",submission:"Clean draft with great pacing.",grade:"Strong Output – Minor Touchups Required",feedback:"One sentence trimmed in the body.",finalOutput:"Final version with light edits to mid-section.",prodSuffix:"GU",tsSubmitted:"Jan 19, 2026, 08:55 AM",tsReviewed:"Jan 21, 2026, 02:10 PM",tsProduction:"Jan 21, 2026, 02:10 PM",parentCode:null,codeToRework:"",updatedBeats:""},
  {id:6,assignmentType:"improvement",beatId:null,code:"00006",editCode:"GA5599",show:"FLBM",angle:"Burnout Culture — Deeper Dive",writer:"Krystle Drew",podLead:"Joshua Roth",dateAssigned:"2026-01-15",dateDue:"2026-01-23",notes:"Strong CTA at the end.",status:"Completed by Writer",submission:"Submitted with compelling CTA and tight body copy.",grade:"",feedback:"",finalOutput:"",prodSuffix:"",tsSubmitted:"Jan 21, 2026, 11:40 AM",tsReviewed:null,tsProduction:null,parentCode:null,codeToRework:"GU00002",updatedBeats:"https://docs.google.com/mock-update2"},
  {id:7,assignmentType:"new",beatId:"B0006",code:"00007",editCode:"GU7721",show:"MVS",angle:"Story Structure and Emotional Memory",writer:"Jasper Chen",podLead:"Paul Lee",dateAssigned:"2026-01-15",dateDue:"2026-01-24",notes:"Avoid passive voice throughout.",status:"Assigned to Writer",submission:"",grade:"",feedback:"",finalOutput:"",prodSuffix:"",tsSubmitted:null,tsReviewed:null,tsProduction:null,parentCode:null,codeToRework:"",updatedBeats:""},
  {id:8,assignmentType:"new",beatId:"B0001",code:"GA00008",editCode:"GA2200",show:"MVS",angle:"Sleep & Cortisol — Short Form",writer:"Carolina Munhoz",podLead:"Dan Woodward",dateAssigned:"2026-01-16",dateDue:"2026-01-25",notes:"Research-heavy — cite at least 3 data points.",status:"Rewrite Required",submission:"Draft missing supporting data in section 3.",grade:"Minor Flaws – Pacing / Opening Idea",feedback:"Opening idea falls flat. Rework the angle.",finalOutput:"",prodSuffix:"",tsSubmitted:"Jan 22, 2026, 03:30 PM",tsReviewed:"Jan 24, 2026, 10:15 AM",tsProduction:null,parentCode:null,codeToRework:"",updatedBeats:""},
  {id:9,assignmentType:"new",beatId:"B0005",code:"GA00009",editCode:"GA1188",show:"WBT",angle:"Voluntary Discomfort — Long Form",writer:"Micah McFarland",podLead:"Nishant Gilatar",dateAssigned:"2026-01-17",dateDue:"2026-01-26",notes:"Match the tone of the existing series.",status:"Ready for Production",submission:"Polished draft consistent with series voice.",grade:"Strong Output – Minor Touchups Required",feedback:"Minor punctuation edits only.",finalOutput:"Final version ready.",prodSuffix:"GA",tsSubmitted:"Jan 23, 2026, 09:00 AM",tsReviewed:"Jan 25, 2026, 01:20 PM",tsProduction:"Jan 25, 2026, 01:20 PM",parentCode:null,codeToRework:"",updatedBeats:""},
  {id:10,assignmentType:"improvement",beatId:null,code:"00010",editCode:"GU9900",show:"WBT",angle:"Decision Fatigue — Revised Angle",writer:"Joe Osborn",podLead:"Joshua Roth",dateAssigned:"2026-01-18",dateDue:"2026-01-27",notes:"Second draft — address pacing notes.",status:"Assigned to Writer",submission:"",grade:"",feedback:"",finalOutput:"",prodSuffix:"",tsSubmitted:null,tsReviewed:null,tsProduction:null,parentCode:"00003",codeToRework:"00003",updatedBeats:"https://docs.google.com/mock-update3"},
];

function useSharedState(){
  const [writers,setWriters]   = useState(INIT_WRITERS);
  const [pods,setPods]         = useState(INIT_PODS);
  const [bizTeam,setBizTeam]   = useState(INIT_BIZ);
  const [entries,setEntries]   = useState(MOCK_ENTRIES);
  const [ideas,setIdeas]       = useState(MOCK_IDEAS);
  const [beats,setBeats]       = useState(MOCK_BEATS);
  const [ideaCounter,setIdeaCounter] = useState(11);
  const [beatCounter,setBeatCounter] = useState(9);
  const [aCounter,setACounter] = useState(21);
  return {writers,setWriters,pods,setPods,bizTeam,setBizTeam,entries,setEntries,
    ideas,setIdeas,beats,setBeats,ideaCounter,setIdeaCounter,beatCounter,setBeatCounter,aCounter,setACounter};
}

// ══════════════════════════════════════════════════════════
// NEW IDEAS WORKSPACE
// ══════════════════════════════════════════════════════════
function NewIdeasWorkspace({shared,onBack}){
  const {pods,writers,ideas,setIdeas,beats,setBeats,ideaCounter,setIdeaCounter,beatCounter,setBeatCounter} = shared;
  const [role,setRole]       = useState(null);
  const [toast,setToast]     = useState(null);
  const [ideaForm,setIdeaForm] = useState({show:"MVS",angle:"",submittedBy:"",submittedOn:today(),setting:"",opening:"",tickingClock:"",stakes:"",goal:"",cliffhanger:"",note:""});
  const [addBeatFor,setAddBeatFor] = useState(null);
  const [beatForm,setBeatForm]     = useState(emptyBeatForm());
  const [filters,setFilters]       = useState({show:"",status:"",submittedBy:""});
  const showToast = (msg,err=false)=>{setToast({msg,err});setTimeout(()=>setToast(null),2800);};
  const canManage = role==="pod"||role==="business";

  const saveIdea = ()=>{
    if(!ideaForm.angle.trim()||!ideaForm.submittedBy){showToast("Fill in all required fields.",true);return;}
    const missing = IDEA_FIELDS.find(f=>!ideaForm[f.key].trim());
    if(missing){showToast(`Please fill in "${missing.label}" (enter NA if not applicable).`,true);return;}
    const id = padI(ideaCounter);
    setIdeas(p=>[...p,{id,...ideaForm,status:"Not Reviewed"}]);
    setIdeaCounter(c=>c+1);
    setIdeaForm({show:"MVS",angle:"",submittedBy:"",submittedOn:today(),setting:"",opening:"",tickingClock:"",stakes:"",goal:"",cliffhanger:"",note:""});
    showToast(`Idea ${id} submitted — allocated ID: ${id}`);
  };

  const updateIdeaStatus = (ideaId,status)=>setIdeas(p=>p.map(i=>i.id===ideaId?{...i,status}:i));

  const openAddBeat = (idea)=>{
    setBeatForm({...emptyBeatForm(),setting:idea.setting||"",opening:idea.opening||"",tickingClock:idea.tickingClock||"",stakes:idea.stakes||"",goal:idea.goal||"",cliffhanger:idea.cliffhanger||"",note:idea.note||""});
    setAddBeatFor(idea.id);
  };

  const saveBeat = ()=>{
    if(!beatForm.title.trim()||!beatForm.assignedTo||!beatForm.expectedStartDate||!beatForm.expectedCompleteDate){showToast("Fill in all required fields.",true);return;}
    const missing = BEAT_FIELDS.find(f=>!beatForm[f.key].trim());
    if(missing){showToast(`Please fill in "${missing.label}" (enter NA if not applicable).`,true);return;}
    const id = padB(beatCounter);
    setBeats(p=>[...p,{id,ideaId:addBeatFor,...beatForm,status:"Assigned",submittedOn:"",reviewedBy:"",reviewedOn:"",reviewNotes:""}]);
    setBeatCounter(c=>c+1);
    setAddBeatFor(null);setBeatForm(emptyBeatForm());
    showToast(`Beat ${id} created and assigned.`);
  };

  if(!role) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:440,width:"100%"}}>
        <button onClick={onBack} style={{...btn(C.surface2),border:`1px solid ${C.border}`,marginBottom:32,fontSize:12}}>← Back</button>
        <div style={{fontSize:28,fontWeight:800,marginBottom:6}}>New Ideas</div>
        <div style={{color:C.muted,marginBottom:28}}>Sign in to continue</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>setRole("pod")} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),padding:13,fontSize:14,borderRadius:12}}>POD Lead</button>
          <button onClick={()=>setRole("business")} style={{...btn("linear-gradient(135deg,#0d9488,#059669)"),padding:13,fontSize:14,borderRadius:12}}>Business Team</button>
          <button onClick={()=>setRole("all")} style={{...btn("linear-gradient(135deg,#2563eb,#1d4ed8)"),padding:13,fontSize:14,borderRadius:12}}>Writer / Other</button>
        </div>
      </div>
    </div>
  );

  const filtered = ideas.filter(i=>(!filters.show||i.show===filters.show)&&(!filters.status||i.status===filters.status)&&(!filters.submittedBy||i.submittedBy===filters.submittedBy));

  return(
    <div style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",background:C.bg,color:C.text}}>
      {toast&&<div style={{position:"fixed",top:16,right:16,background:toast.err?C.danger:C.success,color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:600,zIndex:999,fontSize:14}}>{toast.msg}</div>}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12}}>NI</div>
        <div><div style={{fontWeight:800,fontSize:16}}>New Ideas</div><div style={{fontSize:11,color:C.muted}}>{role==="pod"?"POD Lead":role==="business"?"Business Team":"Writer / Other"}</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={()=>setRole(null)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,fontSize:12}}>Switch Role</button>
          <button onClick={onBack} style={{...btn(C.surface2),border:`1px solid ${C.border}`,fontSize:12}}>Home</button>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px",display:"grid",gridTemplateColumns:"360px 1fr",gap:20,alignItems:"start"}}>
        <div style={card()}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:18}}>Submit a New Idea</div>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div><Lbl c="SHOW *"/><select value={ideaForm.show} onChange={e=>setIdeaForm(f=>({...f,show:e.target.value}))} style={sel()}>{SHOWS.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><Lbl c="ANGLE NAME *"/><input value={ideaForm.angle} onChange={e=>setIdeaForm(f=>({...f,angle:e.target.value}))} placeholder="Describe the angle…" style={inp()}/></div>
            {IDEA_FIELDS.map(({key,label})=>(
              <div key={key}><Lbl c={`${label.toUpperCase()} * (NA if not applicable)`}/>
                <textarea value={ideaForm[key]} onChange={e=>setIdeaForm(f=>({...f,[key]:e.target.value}))} rows={2} style={{...inp(),resize:"vertical"}}/>
              </div>
            ))}
            <div><Lbl c="SUBMITTED BY *"/><select value={ideaForm.submittedBy} onChange={e=>setIdeaForm(f=>({...f,submittedBy:e.target.value}))} style={sel()}><option value="">— Select —</option>{ALL_PEOPLE.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><Lbl c="SUBMITTED ON"/><input type="date" value={ideaForm.submittedOn} onChange={e=>setIdeaForm(f=>({...f,submittedOn:e.target.value}))} style={inp()}/></div>
            <button onClick={saveIdea} style={{...btn("linear-gradient(135deg,#7c3aed,#6d28d9)"),padding:10,marginTop:4}}>Submit Idea</button>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={card({padding:14})}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <select value={filters.show} onChange={e=>setFilters(f=>({...f,show:e.target.value}))} style={sel()}><option value="">All Shows</option>{SHOWS.map(s=><option key={s}>{s}</option>)}</select>
              <select value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))} style={sel()}><option value="">All Statuses</option>{IDEA_STATUSES.map(s=><option key={s}>{s}</option>)}</select>
              <select value={filters.submittedBy} onChange={e=>setFilters(f=>({...f,submittedBy:e.target.value}))} style={sel()}><option value="">All Submitters</option>{ALL_PEOPLE.map(p=><option key={p}>{p}</option>)}</select>
            </div>
          </div>
          {filtered.length===0?<div style={{...card(),textAlign:"center",padding:40,color:C.muted}}>No ideas found.</div>:filtered.map(idea=>{
            const ideaBeats=beats.filter(b=>b.ideaId===idea.id);
            return(
              <div key={idea.id} style={card({padding:16})}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,color:"#a78bfa",fontSize:13}}>{idea.id}</span>
                  <span style={{background:C.accent+"33",color:"#a78bfa",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{idea.show}</span>
                  <span style={{fontWeight:700,flex:1,fontSize:14}}>{idea.angle}</span>
                </div>
                <div style={{display:"flex",gap:16,fontSize:12,color:C.muted,marginBottom:12}}><span>By: {idea.submittedBy}</span><span>On: {idea.submittedOn}</span></div>
                {BEAT_FIELDS.some(f=>idea[f.key]&&idea[f.key]!=="NA")&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
                    {BEAT_FIELDS.map(({key,label})=>idea[key]?(
                      <div key={key} style={{background:C.surface2,borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:2,textTransform:"uppercase",letterSpacing:.5}}>{label}</div>
                        <div style={{fontSize:12,lineHeight:1.5}}>{idea[key]}</div>
                      </div>
                    ):null)}
                  </div>
                )}
                <div style={{background:C.surface2,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                  <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:.6}}>Idea Review Status</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <Badge status={idea.status} colorMap={IDEA_STATUS_COLOR}/>
                    {canManage&&(<div style={{display:"flex",gap:6,marginLeft:4}}>
                      {["Accepted","Rejected"].map(s=>{
                        const active=idea.status===s; const color=IDEA_STATUS_COLOR[s];
                        return <button key={s} onClick={()=>!active&&updateIdeaStatus(idea.id,s)} style={{...btn(active?color:C.surface),border:`1px solid ${active?color:C.border}`,color:active?"#fff":color,padding:"4px 14px",fontSize:12,opacity:active?.75:1,cursor:active?"default":"pointer"}}>{active?"✓ "+s:s}</button>;
                      })}
                      {idea.status!=="Not Reviewed"&&<button onClick={()=>updateIdeaStatus(idea.id,"Not Reviewed")} style={{...btn(C.surface),border:`1px solid ${C.border}`,color:C.muted,padding:"4px 10px",fontSize:11}}>Reset</button>}
                    </div>)}
                  </div>
                </div>
                <div style={{background:C.surface2,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.6}}>Beats Execution Status</div>
                    {canManage&&<button onClick={()=>openAddBeat(idea)} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),padding:"4px 12px",fontSize:11}}>+ Assign Beat</button>}
                  </div>
                  {ideaBeats.length===0?<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>No beats assigned yet.</div>:(
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      <div style={{display:"grid",gridTemplateColumns:"80px 1fr 130px 80px 90px",gap:8,padding:"4px 8px"}}>
                        {["Beat Code","Title","Status","Beats Doc","Assigned To"].map(h=><span key={h} style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{h}</span>)}
                      </div>
                      {ideaBeats.map(b=>(
                        <div key={b.id} style={{display:"grid",gridTemplateColumns:"80px 1fr 130px 80px 90px",gap:8,alignItems:"center",background:C.bg,borderRadius:8,padding:"8px 10px"}}>
                          <span style={{fontWeight:700,color:C.info,fontSize:12}}>{b.id}</span>
                          <span style={{fontSize:12}}>{b.title}</span>
                          <Badge status={b.status} colorMap={BEATS_STATUS_COLOR}/>
                          {b.docLink?<a href={b.docLink} target="_blank" rel="noreferrer" style={{fontSize:12,color:C.info,textDecoration:"none",fontWeight:600}}>View →</a>:<span style={{fontSize:12,color:C.muted}}>—</span>}
                          <span style={{fontSize:11,color:C.muted}}>{b.assignedTo.split(" ")[0]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {addBeatFor&&(
        <Modal title={`Assign Beat — ${addBeatFor}`} onClose={()=>setAddBeatFor(null)} wide>
          <div style={{background:C.surface2,borderRadius:8,padding:"8px 14px",fontSize:12,color:C.muted,marginBottom:16}}>Beat Code: <strong style={{color:C.info}}>{padB(beatCounter)}</strong></div>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div><Lbl c="BEAT TITLE *"/><input value={beatForm.title} onChange={e=>setBeatForm(f=>({...f,title:e.target.value}))} placeholder="Enter beat title…" style={inp()}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {BEAT_FIELDS.map(({key,label})=>(
                <div key={key}><Lbl c={`${label.toUpperCase()} * (NA if not applicable)`}/>
                  <textarea value={beatForm[key]} onChange={e=>setBeatForm(f=>({...f,[key]:e.target.value}))} rows={2} style={{...inp(),resize:"vertical"}}/>
                </div>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><Lbl c="ASSIGN TO *"/><select value={beatForm.assignedTo} onChange={e=>setBeatForm(f=>({...f,assignedTo:e.target.value}))} style={sel()}><option value="">— Select —</option><optgroup label="Writers">{writers.map(w=><option key={w}>{w}</option>)}</optgroup><optgroup label="POD Leads">{INIT_PODS.map(p=><option key={p}>{p}</option>)}</optgroup></select></div>
              <div><Lbl c="ROLE"/><select value={beatForm.assignedRole} onChange={e=>setBeatForm(f=>({...f,assignedRole:e.target.value}))} style={sel()}><option>Writer</option><option>POD Lead</option></select></div>
              <div><Lbl c="REQUEST RAISED ON"/><input type="date" value={beatForm.requestRaisedOn} onChange={e=>setBeatForm(f=>({...f,requestRaisedOn:e.target.value}))} style={inp()}/></div>
              <div><Lbl c="EXPECTED START DATE *"/><input type="date" value={beatForm.expectedStartDate} onChange={e=>setBeatForm(f=>({...f,expectedStartDate:e.target.value}))} style={inp()}/></div>
              <div><Lbl c="EXPECTED COMPLETE DATE *"/><input type="date" value={beatForm.expectedCompleteDate} onChange={e=>setBeatForm(f=>({...f,expectedCompleteDate:e.target.value}))} style={inp()}/></div>
              <div><Lbl c="BEATS DOC LINK (if available)"/><input value={beatForm.docLink} onChange={e=>setBeatForm(f=>({...f,docLink:e.target.value}))} placeholder="https://docs.google.com/…" style={inp()}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={saveBeat} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),flex:1,padding:10}}>Create & Assign Beat</button>
              <button onClick={()=>setAddBeatFor(null)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"10px 18px"}}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// BEATS WORKSPACE
// ══════════════════════════════════════════════════════════
function BeatsWorkspace({shared,onBack}){
  const {beats,setBeats,writers,pods,ideas} = shared;
  const [role,setRole]   = useState(null);
  const [myName,setMyName] = useState("");
  const [toast,setToast] = useState(null);
  const [expanded,setExpanded] = useState(new Set());
  const [filters,setFilters]   = useState({status:"",assignedTo:"",ideaId:""});
  const [submitModal,setSubmitModal] = useState(null);
  const [reviewModal,setReviewModal] = useState(null);
  const [submitForm,setSubmitForm]   = useState({docLink:""});
  const [reviewForm,setReviewForm]   = useState({decision:"Approved for Script Writing",reviewedBy:"",notes:""});
  const showToast = (msg,err=false)=>{setToast({msg,err});setTimeout(()=>setToast(null),2800);};
  const canReview = role==="business"||role==="pod";
  const toggleExpand = id=>setExpanded(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});

  const visibleBeats = useMemo(()=>{
    let list = role==="writer"?beats.filter(b=>b.assignedTo===myName):beats;
    return list.filter(b=>(!filters.status||b.status===filters.status)&&(!filters.assignedTo||b.assignedTo===filters.assignedTo)&&(!filters.ideaId||b.ideaId===filters.ideaId));
  },[beats,role,myName,filters]);

  const doSubmit = ()=>{
    if(!submitForm.docLink.trim()){showToast("Please add the beats doc link.",true);return;}
    setBeats(p=>p.map(b=>b.id===submitModal.id?{...b,status:"Submitted",docLink:submitForm.docLink,submittedOn:today()}:b));
    setSubmitModal(null);showToast("Beat submitted.");
  };
  const doReview = ()=>{
    if(!reviewForm.reviewedBy){showToast("Select reviewer.",true);return;}
    setBeats(p=>p.map(b=>b.id===reviewModal.id?{...b,status:reviewForm.decision,reviewedBy:reviewForm.reviewedBy,reviewedOn:today(),reviewNotes:reviewForm.notes}:b));
    setReviewModal(null);showToast("Review saved.");
  };

  if(!role) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:440,width:"100%"}}>
        <button onClick={onBack} style={{...btn(C.surface2),border:`1px solid ${C.border}`,marginBottom:32,fontSize:12}}>← Back</button>
        <div style={{fontSize:28,fontWeight:800,marginBottom:6}}>Beats</div>
        <div style={{color:C.muted,marginBottom:28}}>Sign in to continue</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>setRole("business")} style={{...btn("linear-gradient(135deg,#0d9488,#059669)"),padding:13,fontSize:14,borderRadius:12}}>Business Team</button>
          <button onClick={()=>setRole("pod")} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),padding:13,fontSize:14,borderRadius:12}}>POD Lead</button>
          <div style={card({textAlign:"left"})}>
            <div style={{fontWeight:600,marginBottom:10,fontSize:14}}>Writer / POD Lead (Personal View)</div>
            <select value={myName} onChange={e=>setMyName(e.target.value)} style={sel({marginBottom:10})}>
              <option value="">— Select your name —</option>
              <optgroup label="Writers">{writers.map(w=><option key={w}>{w}</option>)}</optgroup>
              <optgroup label="POD Leads">{pods.map(p=><option key={p}>{p}</option>)}</optgroup>
            </select>
            <button onClick={()=>{if(myName)setRole("writer");}} disabled={!myName} style={{...btn("linear-gradient(135deg,#2563eb,#1d4ed8)"),width:"100%",padding:10,opacity:myName?1:.4}}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );

  const uniqueIdeas=[...new Set(beats.map(b=>b.ideaId))];
  return(
    <div style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",background:C.bg,color:C.text}}>
      {toast&&<div style={{position:"fixed",top:16,right:16,background:toast.err?C.danger:C.success,color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:600,zIndex:999,fontSize:14}}>{toast.msg}</div>}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0d9488,#059669)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12}}>BT</div>
        <div><div style={{fontWeight:800,fontSize:16}}>Beats</div><div style={{fontSize:11,color:C.muted}}>{role==="business"?"Business Team":role==="pod"?"POD Lead":`Assigned to — ${myName}`}</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={()=>{setRole(null);setMyName("");}} style={{...btn(C.surface2),border:`1px solid ${C.border}`,fontSize:12}}>Switch Role</button>
          <button onClick={onBack} style={{...btn(C.surface2),border:`1px solid ${C.border}`,fontSize:12}}>Home</button>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
          {BEATS_STATUSES.map(s=>(<div key={s} style={card({padding:16})}><div style={{fontSize:11,color:BEATS_STATUS_COLOR[s],fontWeight:600,marginBottom:4}}>{s}</div><div style={{fontSize:30,fontWeight:800}}>{beats.filter(b=>b.status===s).length}</div></div>))}
          <div style={card({padding:16})}><div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:4}}>TOTAL</div><div style={{fontSize:30,fontWeight:800}}>{beats.length}</div></div>
        </div>
        <div style={card({padding:14,marginBottom:16})}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:10}}>
            <select value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))} style={sel()}><option value="">All Statuses</option>{BEATS_STATUSES.map(s=><option key={s}>{s}</option>)}</select>
            <select value={filters.assignedTo} onChange={e=>setFilters(f=>({...f,assignedTo:e.target.value}))} style={sel()}><option value="">All Assignees</option>{[...writers,...pods].sort().map(p=><option key={p}>{p}</option>)}</select>
            <select value={filters.ideaId} onChange={e=>setFilters(f=>({...f,ideaId:e.target.value}))} style={sel()}><option value="">All Ideas</option>{uniqueIdeas.map(id=><option key={id}>{id}</option>)}</select>
            <button onClick={()=>setFilters({status:"",assignedTo:"",ideaId:""})} style={{...btn(C.surface2),border:`1px solid ${C.border}`}}>Clear</button>
          </div>
        </div>
        <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Showing {visibleBeats.length} of {beats.length} beats</div>
        {visibleBeats.length===0?<div style={{...card(),textAlign:"center",padding:60,color:C.muted}}>No beats match your filters.</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {visibleBeats.map(b=>{
              const isExpanded=expanded.has(b.id);
              const canSubmit=(role==="writer")&&(b.status==="Assigned"||b.status==="To be Redone");
              return(
                <div key={b.id} style={card({padding:16})}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:10}}>
                    <span style={{fontWeight:700,color:C.info,fontSize:13}}>{b.id}</span>
                    <span style={{background:C.surface2,color:C.muted,padding:"2px 8px",borderRadius:12,fontSize:11}}>{b.ideaId}</span>
                    <span style={{fontWeight:700,fontSize:15,flex:1}}>{b.title}</span>
                    <Badge status={b.status} colorMap={BEATS_STATUS_COLOR}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:10}}>
                    {[["Assigned To",`${b.assignedTo} (${b.assignedRole})`],["Request Raised",b.requestRaisedOn],["Expected Start",b.expectedStartDate],["Expected Complete",b.expectedCompleteDate]].map(([k,v])=>(
                      <div key={k} style={{background:C.surface2,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:2,textTransform:"uppercase",letterSpacing:.5}}>{k}</div><div style={{fontSize:12,fontWeight:500}}>{v||"—"}</div></div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}>
                    {b.docLink?<a href={b.docLink} target="_blank" rel="noreferrer" style={{fontSize:13,color:C.info,fontWeight:600,textDecoration:"none"}}>📄 View Beats Doc →</a>:<span style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>No beats doc yet</span>}
                    {b.reviewNotes&&<div style={{background:C.danger+"15",border:`1px solid ${C.danger}33`,borderRadius:8,padding:"6px 12px",fontSize:12,flex:1}}><span style={{color:C.danger,fontWeight:600}}>Review Note:</span> {b.reviewNotes}{b.reviewedBy&&<span style={{color:C.muted,marginLeft:8}}>— {b.reviewedBy}, {b.reviewedOn}</span>}</div>}
                  </div>
                  <button onClick={()=>toggleExpand(b.id)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"5px 14px",fontSize:12,marginBottom:isExpanded?12:0}}>{isExpanded?"▲ Hide Beat Details":"▼ View Beat Details"}</button>
                  {isExpanded&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
                      {BEAT_FIELDS.map(({key,label})=>(
                        <div key={key} style={{background:C.surface2,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:2,textTransform:"uppercase",letterSpacing:.5}}>{label}</div><div style={{fontSize:12,lineHeight:1.5}}>{b[key]||"—"}</div></div>
                      ))}
                    </div>
                  )}
                  <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                    {canSubmit&&<button onClick={()=>{setSubmitModal(b);setSubmitForm({docLink:b.docLink||""});}} style={{...btn("linear-gradient(135deg,#059669,#0d9488)"),padding:"7px 18px"}}>{b.status==="To be Redone"?"Resubmit Beat":"Submit Beat"}</button>}
                    {canReview&&b.status==="Submitted"&&<button onClick={()=>{setReviewModal(b);setReviewForm({decision:"Approved for Script Writing",reviewedBy:"",notes:""}); }} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),padding:"7px 18px"}}>Review</button>}
                    {b.status==="Approved for Script Writing"&&<span style={{fontSize:12,color:C.success,fontWeight:600,alignSelf:"center"}}>✓ Approved for script writing</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {submitModal&&(
        <Modal title={`Submit Beat — ${submitModal.id}`} onClose={()=>setSubmitModal(null)}>
          <div style={{background:C.surface2,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13}}><div style={{fontWeight:600,marginBottom:4}}>{submitModal.title}</div><div style={{color:C.muted,fontSize:12}}>Assigned to: {submitModal.assignedTo} · Due: {submitModal.expectedCompleteDate}</div></div>
          {submitModal.reviewNotes&&<div style={{background:C.danger+"15",border:`1px solid ${C.danger}33`,borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:14}}><strong style={{color:C.danger}}>Redo notes:</strong> {submitModal.reviewNotes}</div>}
          <Lbl c="BEATS DOC LINK *"/><input value={submitForm.docLink} onChange={e=>setSubmitForm(f=>({...f,docLink:e.target.value}))} placeholder="https://docs.google.com/…" style={{...inp(),marginBottom:16}}/>
          <div style={{display:"flex",gap:10}}><button onClick={doSubmit} style={{...btn("linear-gradient(135deg,#059669,#0d9488)"),flex:1,padding:10}}>Submit</button><button onClick={()=>setSubmitModal(null)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"10px 18px"}}>Cancel</button></div>
        </Modal>
      )}
      {reviewModal&&(
        <Modal title={`Review Beat — ${reviewModal.id}`} onClose={()=>setReviewModal(null)}>
          <div style={{background:C.surface2,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13}}><div style={{fontWeight:600,marginBottom:4}}>{reviewModal.title}</div><div style={{color:C.muted,fontSize:12}}>By: {reviewModal.assignedTo} · Submitted: {reviewModal.submittedOn}</div>{reviewModal.docLink&&<a href={reviewModal.docLink} target="_blank" rel="noreferrer" style={{fontSize:12,color:C.info,fontWeight:600}}>📄 View Doc →</a>}</div>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div><Lbl c="DECISION *"/><div style={{display:"flex",gap:8}}>
              {["Approved for Script Writing","To be Redone"].map(d=>(
                <button key={d} onClick={()=>setReviewForm(f=>({...f,decision:d}))} style={{...btn(reviewForm.decision===d?(d==="Approved for Script Writing"?C.success:C.danger):C.surface2),border:`1px solid ${reviewForm.decision===d?(d==="Approved for Script Writing"?C.success:C.danger):C.border}`,flex:1,fontSize:12,padding:"8px 10px"}}>{d==="Approved for Script Writing"?"✓ Approve":"↩ To be Redone"}</button>
              ))}
            </div></div>
            <div><Lbl c="REVIEWED BY *"/><select value={reviewForm.reviewedBy} onChange={e=>setReviewForm(f=>({...f,reviewedBy:e.target.value}))} style={sel()}><option value="">— Select —</option>{[...INIT_BIZ,...INIT_PODS].sort().map(p=><option key={p}>{p}</option>)}</select></div>
            <div><Lbl c="REVIEW NOTES"/><textarea value={reviewForm.notes} onChange={e=>setReviewForm(f=>({...f,notes:e.target.value}))} rows={3} style={{...inp(),resize:"vertical"}} placeholder="Add feedback or instructions…"/></div>
            <div style={{display:"flex",gap:10}}><button onClick={doReview} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),flex:1,padding:10}}>Submit Review</button><button onClick={()=>setReviewModal(null)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"10px 18px"}}>Cancel</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// WRITING ASSIGNMENTS WORKSPACE
// ══════════════════════════════════════════════════════════
function WritingWorkspace({shared,onBack}){
  const {writers,pods,setWriters,setPods,entries,setEntries,beats,aCounter,setACounter} = shared;
  const [role,setRole]     = useState(null);
  const [myName,setMyName] = useState("");
  const [tab,setTab]       = useState("dashboard");
  const [toast,setToast]   = useState(null);
  const [nw,setNw]=useState(""); const [np,setNp]=useState("");

  // Modals
  const [assignBeatModal,setAssignBeatModal] = useState(null); // holds beat object
  const [improvModal,setImprovModal]         = useState(false);
  const [submitModal,setSubmitModal]         = useState(null);
  const [gradeModal,setGradeModal]           = useState(null);
  const [viewModal,setViewModal]             = useState(null);
  const [prodModal,setProdModal]             = useState(null);

  // Forms
  const [beatAssignForm,setBeatAssignForm] = useState({writer:"",podLead:"",dateAssigned:today(),dateDue:"",notes:"",editCode:""});
  const [improvForm,setImprovForm]         = useState({show:"MVS",angle:"",editCode:"",codeToRework:"",updatedBeats:"",writer:"",podLead:"",dateAssigned:today(),dateDue:"",notes:""});
  const [subText,setSubText]   = useState("");
  const [gForm,setGForm]       = useState({grade:GRADES[0],feedback:"",finalOutput:""});
  const [prodType,setProdType] = useState(PROD_TYPES[0].suffix);

  // Filters
  const [aFilters,setAFilters] = useState({code:"",writer:"",podLead:"",status:"",assignmentType:""});
  const [aSortCol,setASortCol] = useState("code");
  const [aSortDir,setASortDir] = useState("asc");

  const showToast=(msg,err=false)=>{setToast({msg,err});setTimeout(()=>setToast(null),2800);};
  const isValidEditCode=c=>/^(GU|GA)\d+$/i.test(c.trim());

  const approvedBeats = useMemo(()=>beats.filter(b=>b.status==="Approved for Script Writing"),[beats]);
  const assignedBeatIds = useMemo(()=>new Set(entries.filter(e=>e.beatId).map(e=>e.beatId)),[entries]);
  const unassignedApprovedBeats = useMemo(()=>approvedBeats.filter(b=>!assignedBeatIds.has(b.id)),[approvedBeats,assignedBeatIds]);

  const allFiltered = useMemo(()=>{
    let rows=entries.filter(e=>
      (!aFilters.code||e.code.toLowerCase().includes(aFilters.code.toLowerCase())||e.editCode.toLowerCase().includes(aFilters.code.toLowerCase()))&&
      (!aFilters.writer||e.writer===aFilters.writer)&&
      (!aFilters.podLead||e.podLead===aFilters.podLead)&&
      (!aFilters.status||e.status===aFilters.status)&&
      (!aFilters.assignmentType||e.assignmentType===aFilters.assignmentType)
    );
    return [...rows].sort((a,b)=>{let va=a[aSortCol]||"",vb=b[aSortCol]||"";return aSortDir==="asc"?va.localeCompare(vb):vb.localeCompare(va);});
  },[entries,aFilters,aSortCol,aSortDir]);

  const myAssignments = useMemo(()=>entries.filter(e=>e.writer===myName),[entries,myName]);
  const pendingReview  = entries.filter(e=>e.status==="Completed by Writer");
  const toggleSort=col=>{if(aSortCol===col)setASortDir(d=>d==="asc"?"desc":"asc");else{setASortCol(col);setASortDir("asc");}};
  const SortIcon=({col})=><span style={{opacity:.4,fontSize:10}}>{aSortCol===col?(aSortDir==="asc"?" ↑":" ↓"):" ↕"}</span>;

  // Create writing assignment from an approved beat
  const saveFromBeat=()=>{
    if(!beatAssignForm.editCode.trim()){showToast("Enter the content code.",true);return;}
    if(!isValidEditCode(beatAssignForm.editCode)){showToast("Code must start with GU or GA followed by digits.",true);return;}
    if(!beatAssignForm.writer||!beatAssignForm.podLead||!beatAssignForm.dateDue){showToast("Fill in all required fields.",true);return;}
    const code=padA(aCounter);
    const b=assignBeatModal;
    setEntries(p=>[...p,{id:Date.now(),assignmentType:"new",beatId:b.id,code,editCode:beatAssignForm.editCode.toUpperCase(),show:shared.ideas.find(i=>i.id===b.ideaId)?.show||"",angle:b.title,writer:beatAssignForm.writer,podLead:beatAssignForm.podLead,dateAssigned:beatAssignForm.dateAssigned,dateDue:beatAssignForm.dateDue,notes:beatAssignForm.notes,status:"Assigned to Writer",submission:"",grade:"",feedback:"",finalOutput:"",prodSuffix:"",tsSubmitted:null,tsReviewed:null,tsProduction:null,parentCode:null,codeToRework:"",updatedBeats:""}]);
    setACounter(c=>c+1);setAssignBeatModal(null);
    setBeatAssignForm({writer:"",podLead:"",dateAssigned:today(),dateDue:"",notes:"",editCode:""});
    showToast(`Assignment ${code} created from beat ${b.id}.`);
  };

  // Create improvement assignment
  const saveImprovement=()=>{
    if(!improvForm.editCode.trim()){showToast("Enter the content code.",true);return;}
    if(!isValidEditCode(improvForm.editCode)){showToast("Code must start with GU or GA.",true);return;}
    if(!improvForm.angle.trim()||!improvForm.writer||!improvForm.podLead||!improvForm.dateDue){showToast("Fill in all required fields.",true);return;}
    const code=padA(aCounter);
    setEntries(p=>[...p,{id:Date.now(),assignmentType:"improvement",beatId:null,code,editCode:improvForm.editCode.toUpperCase(),show:improvForm.show,angle:improvForm.angle,writer:improvForm.writer,podLead:improvForm.podLead,dateAssigned:improvForm.dateAssigned,dateDue:improvForm.dateDue,notes:improvForm.notes,status:"Assigned to Writer",submission:"",grade:"",feedback:"",finalOutput:"",prodSuffix:"",tsSubmitted:null,tsReviewed:null,tsProduction:null,parentCode:null,codeToRework:improvForm.codeToRework,updatedBeats:improvForm.updatedBeats}]);
    setACounter(c=>c+1);setImprovModal(false);
    setImprovForm({show:"MVS",angle:"",editCode:"",codeToRework:"",updatedBeats:"",writer:"",podLead:"",dateAssigned:today(),dateDue:"",notes:""});
    showToast(`Improvement assignment ${code} created.`);
  };

  const saveSubmit=()=>{
    if(!subText.trim()){showToast("Please enter your submission.",true);return;}
    setEntries(p=>p.map(e=>e.id===submitModal.id?{...e,status:"Completed by Writer",submission:subText,tsSubmitted:tsNow()}:e));
    setSubmitModal(null);setSubText("");showToast("Submitted.");
  };
  const saveGrade=()=>{
    if(!gForm.finalOutput.trim()){showToast("Please paste the final edited output.",true);return;}
    const isRedo=gForm.grade===GRADES[3]; const isStrong=gForm.grade===GRADES[0];
    if(isStrong){
      setEntries(p=>p.map(e=>e.id===gradeModal.id?{...e,grade:gForm.grade,feedback:gForm.feedback,finalOutput:gForm.finalOutput,tsReviewed:tsNow()}:e));
      setProdModal(gradeModal);setProdType(PROD_TYPES[0].suffix);
      setGradeModal(null);setGForm({grade:GRADES[0],feedback:"",finalOutput:""});
    } else if(isRedo){
      const newCode=padA(aCounter);
      setEntries(p=>[...p.map(e=>e.id===gradeModal.id?{...e,status:"Rewrite Required",grade:gForm.grade,feedback:gForm.feedback,finalOutput:gForm.finalOutput,tsReviewed:tsNow()}:e),
        {id:Date.now()+1,assignmentType:gradeModal.assignmentType,beatId:gradeModal.beatId,code:newCode,editCode:gradeModal.editCode,show:gradeModal.show,angle:gradeModal.angle,writer:gradeModal.writer,podLead:gradeModal.podLead,dateAssigned:today(),dateDue:gradeModal.dateDue,notes:gradeModal.notes,status:"Assigned to Writer",submission:"",grade:"",feedback:"",finalOutput:"",prodSuffix:"",tsSubmitted:null,tsReviewed:null,tsProduction:null,parentCode:gradeModal.code,codeToRework:gradeModal.codeToRework,updatedBeats:gradeModal.updatedBeats}]);
      setACounter(c=>c+1);setGradeModal(null);setGForm({grade:GRADES[0],feedback:"",finalOutput:""});
      showToast(`Redo requested. New assignment ${newCode} created.`);
    } else {
      setEntries(p=>p.map(e=>e.id===gradeModal.id?{...e,status:"Rewrite Required",grade:gForm.grade,feedback:gForm.feedback,finalOutput:gForm.finalOutput,tsReviewed:tsNow()}:e));
      setGradeModal(null);setGForm({grade:GRADES[0],feedback:"",finalOutput:""});showToast("Review submitted.");
    }
  };
  const saveProdType=()=>{
    setEntries(p=>p.map(e=>e.id===prodModal.id?{...e,status:"Ready for Production",prodSuffix:prodType,code:prodType+e.code,tsProduction:tsNow()}:e));
    setProdModal(null);showToast("Marked ready for production.");
  };
  const exportCSV=()=>{
    const cols=["Code","Edit Code","Type","Show","Angle","Writer","POD Lead","Date Assigned","Date Due","Status","Grade","Code to Rework","Updated Beats","Writer Submitted At","POD Lead Submitted At","Ready for Production At"];
    const rows=allFiltered.map(e=>[e.code,e.editCode,e.assignmentType,e.show||"",e.angle||"",e.writer,e.podLead,e.dateAssigned,e.dateDue,e.status,e.grade||"",e.codeToRework||"",e.updatedBeats||"",e.tsSubmitted||"",e.tsReviewed||"",e.tsProduction||""].map(v=>`"${v}"`).join(","));
    const csv=[cols.join(","),...rows].join("\n");
    const a=document.createElement("a");a.href="data:text/csv,"+encodeURIComponent(csv);a.download="assignments.csv";a.click();
  };

  if(!role) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:480,width:"100%"}}>
        <button onClick={onBack} style={{...btn(C.surface2),border:`1px solid ${C.border}`,marginBottom:32,fontSize:12}}>← Back</button>
        <div style={{fontSize:28,fontWeight:800,marginBottom:6}}>Writing Assignments</div>
        <div style={{color:C.muted,marginBottom:28}}>Sign in to continue</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={card({textAlign:"left",borderColor:C.accent+"66"})}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6,color:"#a78bfa"}}>POD Lead / Business Team</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:14}}>Assign scripts from approved beats, create improvement requests, review and grade submissions.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setRole("pod");setTab("dashboard");}} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),flex:1,padding:10}}>POD Lead</button>
              <button onClick={()=>{setRole("business");setTab("dashboard");}} style={{...btn("linear-gradient(135deg,#0d9488,#059669)"),flex:1,padding:10}}>Business Team</button>
            </div>
          </div>
          <div style={card({textAlign:"left",borderColor:C.accent2+"66"})}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6,color:"#60a5fa"}}>Writer</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:14}}>View and submit your assigned scripts.</div>
            <select value={myName} onChange={e=>setMyName(e.target.value)} style={sel({marginBottom:10})}><option value="">— Select your name —</option>{writers.map(w=><option key={w}>{w}</option>)}</select>
            <button onClick={()=>{if(myName){setRole("writer");setTab("mine");}}} disabled={!myName} style={{...btn("linear-gradient(135deg,#2563eb,#1d4ed8)"),width:"100%",padding:10,opacity:myName?1:.4}}>Continue as Writer</button>
          </div>
        </div>
      </div>
    </div>
  );

  const isManager = role==="pod"||role==="business";
  const TabBtn=({id,label,badge})=>(
    <button onClick={()=>setTab(id)} style={{...btn(tab===id?"linear-gradient(135deg,#7c3aed,#2563eb)":C.surface2),border:tab===id?"none":`1px solid ${C.border}`,padding:"8px 18px",position:"relative"}}>
      {label}{badge>0&&<span style={{background:C.warning,color:"#000",fontSize:10,fontWeight:800,padding:"1px 6px",borderRadius:10,marginLeft:6}}>{badge}</span>}
    </button>
  );

  return(
    <div style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",background:C.bg,color:C.text}}>
      {toast&&<div style={{position:"fixed",top:16,right:16,background:toast.err?C.danger:C.success,color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:600,zIndex:999,fontSize:14}}>{toast.msg}</div>}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7c3aed,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12}}>WA</div>
        <div><div style={{fontWeight:800,fontSize:16}}>Writing Assignments</div><div style={{fontSize:11,color:C.muted}}>{role==="pod"?"POD Lead":role==="business"?"Business Team":`Writer — ${myName}`}</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={()=>{setRole(null);setMyName("");}} style={{...btn(C.surface2),border:`1px solid ${C.border}`,fontSize:12}}>Switch Role</button>
          <button onClick={onBack} style={{...btn(C.surface2),border:`1px solid ${C.border}`,fontSize:12}}>Home</button>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 16px"}}>
        <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap",alignItems:"center"}}>
          {isManager&&<TabBtn id="dashboard" label="Dashboard" badge={pendingReview.length}/>}
          {isManager&&<TabBtn id="newbeats" label="Assign New Beats" badge={unassignedApprovedBeats.length}/>}
          {isManager&&<TabBtn id="improvements" label="Assign Improvements" badge={0}/>}
          {role==="writer"&&<TabBtn id="mine" label="My Assignments" badge={0}/>}
          <TabBtn id="all" label="All Assignments" badge={0}/>
          {role==="pod"&&<TabBtn id="stats" label="Stats" badge={0}/>}
          {role==="pod"&&<TabBtn id="settings" label="Settings" badge={0}/>}
          {isManager&&tab==="all"&&<button onClick={exportCSV} style={{...btn(C.surface2),border:`1px solid ${C.border}`,marginLeft:"auto"}}>Export CSV</button>}
        </div>

        {/* DASHBOARD */}
        {isManager&&tab==="dashboard"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:24}}>
              {STATUSES.map(s=>(<div key={s} style={card({padding:18})}><div style={{fontSize:11,color:STATUS_COLOR[s],marginBottom:6,fontWeight:600}}>{s}</div><div style={{fontSize:34,fontWeight:800}}>{entries.filter(e=>e.status===s).length}</div></div>))}
              <div style={card({padding:18})}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>TOTAL</div><div style={{fontSize:34,fontWeight:800}}>{entries.length}</div></div>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
              <div style={{...card({padding:16,flex:1,minWidth:200,cursor:"pointer",borderColor:C.accent+"66"}),textAlign:"center"}} onClick={()=>setTab("newbeats")}>
                <div style={{fontSize:32,fontWeight:800,color:"#a78bfa"}}>{unassignedApprovedBeats.length}</div>
                <div style={{fontSize:13,color:C.muted,marginTop:4}}>Beats ready to assign</div>
                <div style={{fontSize:12,color:C.accent,marginTop:8,fontWeight:600}}>Go to Assign New Beats →</div>
              </div>
              <div style={{...card({padding:16,flex:1,minWidth:200,cursor:"pointer",borderColor:C.warning+"66"}),textAlign:"center"}} onClick={()=>setTab("improvements")}>
                <div style={{fontSize:32,fontWeight:800,color:C.warning}}>{entries.filter(e=>e.assignmentType==="improvement").length}</div>
                <div style={{fontSize:13,color:C.muted,marginTop:4}}>Improvement assignments</div>
                <div style={{fontSize:12,color:C.warning,marginTop:8,fontWeight:600}}>Go to Assign Improvements →</div>
              </div>
            </div>
            {pendingReview.length>0&&(
              <div>
                <div style={{fontWeight:700,marginBottom:12,color:C.warning,fontSize:15}}>Pending Review ({pendingReview.length})</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {pendingReview.map(e=>(
                    <div key={e.id} style={card({padding:"14px 18px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"})}>
                      <span style={{fontWeight:700,color:"#a78bfa",minWidth:90}}>{e.code}</span>
                      <span style={{fontSize:12,color:C.info}}>{e.editCode}</span>
                      <span style={{background:e.assignmentType==="improvement"?C.warning+"22":C.success+"22",color:e.assignmentType==="improvement"?C.warning:C.success,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{e.assignmentType==="improvement"?"Improvement":"New Beat"}</span>
                      <span style={{flex:1}}>{e.writer}</span>
                      <span style={{color:C.muted,fontSize:12}}>{e.tsSubmitted}</span>
                      <Badge status={e.status}/>
                      <button onClick={()=>{setGradeModal(e);setGForm({grade:GRADES[0],feedback:"",finalOutput:""}); }} style={btn("linear-gradient(135deg,#7c3aed,#2563eb)",{padding:"6px 16px"})}>Review</button>
                      <button onClick={()=>setViewModal(e)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"6px 14px",fontSize:12}}>View</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pendingReview.length===0&&<div style={{...card(),textAlign:"center",padding:40,color:C.success,fontWeight:600}}>✓ No submissions awaiting review</div>}
          </div>
        )}

        {/* ASSIGN NEW BEATS */}
        {isManager&&tab==="newbeats"&&(
          <div>
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:17,marginBottom:4}}>Assign New Beats</div>
              <div style={{fontSize:13,color:C.muted}}>Beats approved for script writing that don't yet have a writing assignment.</div>
            </div>
            {unassignedApprovedBeats.length===0
              ?<div style={{...card(),textAlign:"center",padding:60,color:C.muted}}>
                  <div style={{fontSize:24,marginBottom:8}}>✓</div>
                  All approved beats have been assigned.
                  {approvedBeats.length>0&&<div style={{marginTop:8,fontSize:12}}>({approvedBeats.length} beat{approvedBeats.length!==1?"s":""} approved total, all assigned)</div>}
                </div>
              :<div style={{display:"flex",flexDirection:"column",gap:12}}>
                {unassignedApprovedBeats.map(b=>{
                  const idea = shared.ideas.find(i=>i.id===b.ideaId);
                  return(
                    <div key={b.id} style={card({padding:16})}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                            <span style={{fontWeight:700,color:C.info,fontSize:13}}>{b.id}</span>
                            {idea&&<span style={{background:C.accent+"33",color:"#a78bfa",padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:700}}>{idea.show}</span>}
                            <span style={{fontSize:11,color:C.muted}}>{b.ideaId}</span>
                            <Badge status={b.status} colorMap={BEATS_STATUS_COLOR}/>
                          </div>
                          <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{b.title}</div>
                          {idea&&<div style={{fontSize:12,color:C.muted,marginBottom:8}}>From idea: {idea.angle}</div>}
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                            {BEAT_FIELDS.slice(0,4).map(({key,label})=>(
                              <div key={key} style={{background:C.surface2,borderRadius:6,padding:"6px 10px"}}>
                                <div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:1}}>{label}</div>
                                <div style={{fontSize:11,lineHeight:1.4}}>{b[key]||"—"}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{display:"flex",gap:12,fontSize:12,color:C.muted,flexWrap:"wrap"}}>
                            <span>Beats by: {b.assignedTo}</span>
                            {b.docLink&&<a href={b.docLink} target="_blank" rel="noreferrer" style={{color:C.info,fontWeight:600}}>📄 Beats Doc →</a>}
                          </div>
                        </div>
                        <button onClick={()=>{setAssignBeatModal(b);setBeatAssignForm({writer:"",podLead:"",dateAssigned:today(),dateDue:"",notes:"",editCode:""}); }}
                          style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),padding:"8px 20px",whiteSpace:"nowrap",flexShrink:0}}>
                          Assign to Writer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )}

        {/* ASSIGN IMPROVEMENTS */}
        {isManager&&tab==="improvements"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontWeight:700,fontSize:17,marginBottom:4}}>Assign Improvements</div>
                <div style={{fontSize:13,color:C.muted}}>Request revisions or improved versions of existing scripts with updated beats.</div>
              </div>
              <button onClick={()=>setImprovModal(true)} style={{...btn("linear-gradient(135deg,#f59e0b,#ef4444)"),padding:"10px 22px",fontSize:14}}>+ New Improvement Request</button>
            </div>
            {entries.filter(e=>e.assignmentType==="improvement").length===0
              ?<div style={{...card(),textAlign:"center",padding:60,color:C.muted}}>No improvement assignments yet.</div>
              :<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                    {["Code","Edit Code","Show","Angle","Code to Rework","Updated Beats","Writer","Status","Actions"].map(h=>(
                      <th key={h} style={{padding:"11px 12px",textAlign:"left",color:C.muted,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:.8,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {entries.filter(e=>e.assignmentType==="improvement").map((e,i,arr)=>(
                      <tr key={e.id} style={{borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}
                        onMouseEnter={ev=>ev.currentTarget.style.background=C.surface2}
                        onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                        <td style={{padding:"10px 12px",fontWeight:700,color:"#a78bfa",whiteSpace:"nowrap"}}>{e.code}</td>
                        <td style={{padding:"10px 12px",color:C.info,fontSize:12}}>{e.editCode}</td>
                        <td style={{padding:"10px 12px",fontSize:12}}>{e.show}</td>
                        <td style={{padding:"10px 12px",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.angle}</td>
                        <td style={{padding:"10px 12px",color:C.warning,fontSize:12,fontWeight:600}}>{e.codeToRework||"—"}</td>
                        <td style={{padding:"10px 12px"}}>{e.updatedBeats?<a href={e.updatedBeats} target="_blank" rel="noreferrer" style={{fontSize:12,color:C.info,fontWeight:600}}>View →</a>:<span style={{color:C.muted,fontSize:12}}>—</span>}</td>
                        <td style={{padding:"10px 12px"}}>{e.writer}</td>
                        <td style={{padding:"10px 12px"}}><Badge status={e.status}/></td>
                        <td style={{padding:"10px 12px",whiteSpace:"nowrap"}}>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>setViewModal(e)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"5px 10px",fontSize:12}}>View</button>
                            {e.status==="Completed by Writer"&&<button onClick={()=>{setGradeModal(e);setGForm({grade:GRADES[0],feedback:"",finalOutput:""}); }} style={btn("linear-gradient(135deg,#7c3aed,#2563eb)",{padding:"5px 10px",fontSize:12})}>Review</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        )}

        {/* WRITER: MY ASSIGNMENTS */}
        {role==="writer"&&tab==="mine"&&(
          <div>
            {myAssignments.length===0
              ?<div style={{...card(),textAlign:"center",padding:60,color:C.muted}}>No assignments yet.</div>
              :<div style={{display:"flex",flexDirection:"column",gap:14}}>
                {myAssignments.map(e=>(
                  <div key={e.id} style={card()}>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
                      <span style={{fontWeight:800,fontSize:17,color:"#a78bfa"}}>{e.code}</span>
                      <span style={{fontSize:13,color:C.info,background:C.info+"18",padding:"2px 10px",borderRadius:20}}>{e.editCode}</span>
                      <span style={{background:e.assignmentType==="improvement"?C.warning+"22":C.success+"22",color:e.assignmentType==="improvement"?C.warning:C.success,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{e.assignmentType==="improvement"?"Improvement":"New Beat"}</span>
                      <Badge status={e.status}/>
                      {e.grade&&<span style={{background:(GRADE_COLOR[e.grade]||C.muted)+"22",color:GRADE_COLOR[e.grade]||C.muted,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{GRADE_SHORT[e.grade]}</span>}
                      {e.parentCode&&<span style={{fontSize:11,color:C.muted}}>Redo of {e.parentCode}</span>}
                    </div>
                    {/* Show / Angle */}
                    {(e.show||e.angle)&&(
                      <div style={{display:"flex",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                        {e.show&&<span style={{background:C.accent+"22",color:"#a78bfa",padding:"2px 10px",borderRadius:12,fontSize:12,fontWeight:600}}>{e.show}</span>}
                        {e.angle&&<span style={{fontSize:13,color:C.muted,fontStyle:"italic"}}>{e.angle}</span>}
                      </div>
                    )}
                    {/* Improvement-specific fields */}
                    {e.assignmentType==="improvement"&&(e.codeToRework||e.updatedBeats)&&(
                      <div style={{background:C.warning+"11",border:`1px solid ${C.warning}33`,borderRadius:8,padding:"10px 14px",marginBottom:10,display:"flex",gap:16,flexWrap:"wrap",fontSize:13}}>
                        {e.codeToRework&&<span style={{color:C.muted}}>Reworking: <strong style={{color:C.warning}}>{e.codeToRework}</strong></span>}
                        {e.updatedBeats&&<a href={e.updatedBeats} target="_blank" rel="noreferrer" style={{color:C.info,fontWeight:600,fontSize:12}}>📄 Updated Beats →</a>}
                      </div>
                    )}
                    <div style={{display:"flex",gap:16,fontSize:12,color:C.muted,marginBottom:10,flexWrap:"wrap"}}>
                      <span>Assigned: {e.dateAssigned}</span><span>Due: {e.dateDue}</span><span>POD: {e.podLead}</span>
                    </div>
                    <div style={{background:C.surface2,borderRadius:8,padding:"10px 14px",marginBottom:10,display:"flex",flexDirection:"column",gap:4}}>
                      <TsRow label="Writer submitted at:" value={e.tsSubmitted}/>
                      <TsRow label="POD lead submitted at:" value={e.tsReviewed}/>
                      <TsRow label="Ready for production at:" value={e.tsProduction}/>
                    </div>
                    {e.notes&&<div style={{fontSize:13,color:C.muted,marginBottom:10,fontStyle:"italic"}}>"{e.notes}"</div>}
                    {e.feedback&&<div style={{background:"#1a2a1a",border:"1px solid #2d5a2d",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:10}}><strong>Feedback:</strong> {e.feedback}</div>}
                    {e.finalOutput&&<div style={{background:"#1a1a2e",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:10,maxHeight:120,overflowY:"auto"}}><div style={{fontSize:11,color:C.muted,marginBottom:4}}>FINAL EDITED OUTPUT</div>{e.finalOutput}</div>}
                    {(e.status==="Assigned to Writer"||e.status==="Rewrite Required")&&(
                      <button onClick={()=>{setSubmitModal(e);setSubText(e.submission||"");}} style={btn("linear-gradient(135deg,#059669,#0d9488)",{padding:"8px 20px"})}>
                        {e.status==="Rewrite Required"?"Resubmit":"Submit Assignment"}
                      </button>
                    )}
                    {e.status==="Completed by Writer"&&<div style={{color:C.warning,fontSize:13}}>Awaiting POD lead review</div>}
                    {e.status==="Ready for Production"&&<div style={{color:C.success,fontSize:13,fontWeight:600}}>Ready for production ({e.prodSuffix})</div>}
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* ALL ASSIGNMENTS */}
        {tab==="all"&&(
          <div>
            <div style={card({padding:14,marginBottom:16})}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
                <input value={aFilters.code} onChange={e=>setAFilters(f=>({...f,code:e.target.value}))} placeholder="Code / Edit Code" style={inp()}/>
                <select value={aFilters.writer} onChange={e=>setAFilters(f=>({...f,writer:e.target.value}))} style={sel()}><option value="">All Writers</option>{writers.map(w=><option key={w}>{w}</option>)}</select>
                <select value={aFilters.podLead} onChange={e=>setAFilters(f=>({...f,podLead:e.target.value}))} style={sel()}><option value="">All POD Leads</option>{pods.map(p=><option key={p}>{p}</option>)}</select>
                <select value={aFilters.status} onChange={e=>setAFilters(f=>({...f,status:e.target.value}))} style={sel()}><option value="">All Statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
                <select value={aFilters.assignmentType} onChange={e=>setAFilters(f=>({...f,assignmentType:e.target.value}))} style={sel()}><option value="">All Types</option><option value="new">New Beat</option><option value="improvement">Improvement</option></select>
                <button onClick={()=>setAFilters({code:"",writer:"",podLead:"",status:"",assignmentType:""})} style={{...btn(C.surface2),border:`1px solid ${C.border}`}}>Clear</button>
              </div>
            </div>
            {allFiltered.length===0
              ?<div style={{...card(),textAlign:"center",padding:60,color:C.muted}}>{entries.length===0?"No assignments yet.":"No results match your filters."}</div>
              :<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                    {[["code","Code"],["editCode","Edit Code"],["assignmentType","Type"],["show","Show"],["writer","Writer"],["podLead","POD Lead"],["dateAssigned","Assigned"],["dateDue","Due"],["status","Status"],["grade","Grade"],["tsSubmitted","Sub'd At"],["tsProduction","Prod At"]].map(([col,lbl])=>(
                      <th key={col} onClick={()=>toggleSort(col)} style={{padding:"11px 12px",textAlign:"left",color:C.muted,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:.8,cursor:"pointer",whiteSpace:"nowrap",userSelect:"none"}}>{lbl}<SortIcon col={col}/></th>
                    ))}
                    <th style={{padding:"11px 12px",color:C.muted,fontSize:11,textTransform:"uppercase"}}>Actions</th>
                  </tr></thead>
                  <tbody>
                    {allFiltered.map((e,i)=>(
                      <tr key={e.id} style={{borderBottom:i<allFiltered.length-1?`1px solid ${C.border}`:"none"}}
                        onMouseEnter={ev=>ev.currentTarget.style.background=C.surface2}
                        onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                        <td style={{padding:"10px 12px",fontWeight:700,color:"#a78bfa",whiteSpace:"nowrap"}}>{e.code}{e.parentCode&&<span style={{fontSize:10,color:C.muted,marginLeft:4}}>R</span>}</td>
                        <td style={{padding:"10px 12px",color:C.info,fontSize:12}}>{e.editCode}</td>
                        <td style={{padding:"10px 12px"}}><span style={{background:e.assignmentType==="improvement"?C.warning+"22":C.success+"22",color:e.assignmentType==="improvement"?C.warning:C.success,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{e.assignmentType==="improvement"?"Improvement":"New Beat"}</span></td>
                        <td style={{padding:"10px 12px",fontSize:12,color:C.muted}}>{e.show||"—"}</td>
                        <td style={{padding:"10px 12px"}}>{e.writer}</td>
                        <td style={{padding:"10px 12px"}}>{e.podLead}</td>
                        <td style={{padding:"10px 12px",color:C.muted,whiteSpace:"nowrap"}}>{e.dateAssigned}</td>
                        <td style={{padding:"10px 12px",color:C.muted,whiteSpace:"nowrap"}}>{e.dateDue}</td>
                        <td style={{padding:"10px 12px"}}><Badge status={e.status}/></td>
                        <td style={{padding:"10px 12px"}}>{e.grade?<span style={{color:GRADE_COLOR[e.grade],fontSize:12,fontWeight:600}}>{GRADE_SHORT[e.grade]}</span>:<span style={{color:C.muted}}>—</span>}</td>
                        <td style={{padding:"10px 12px",color:C.muted,fontSize:12,whiteSpace:"nowrap"}}>{e.tsSubmitted||"—"}</td>
                        <td style={{padding:"10px 12px",color:e.tsProduction?C.success:C.muted,fontSize:12,whiteSpace:"nowrap"}}>{e.tsProduction||"—"}</td>
                        <td style={{padding:"10px 12px",whiteSpace:"nowrap"}}>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>setViewModal(e)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"5px 10px",fontSize:12}}>View</button>
                            {isManager&&e.status==="Completed by Writer"&&<button onClick={()=>{setGradeModal(e);setGForm({grade:GRADES[0],feedback:"",finalOutput:""}); }} style={btn("linear-gradient(135deg,#7c3aed,#2563eb)",{padding:"5px 10px",fontSize:12})}>Review</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
            <div style={{marginTop:10,fontSize:12,color:C.muted}}>Showing {allFiltered.length} of {entries.length} entries</div>
          </div>
        )}

        {/* STATS */}
        {role==="pod"&&tab==="stats"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
            {[
              {label:"By Status",items:STATUSES.map(s=>({label:s,count:entries.filter(e=>e.status===s).length,color:STATUS_COLOR[s]}))},
              {label:"By Type",items:[{label:"New Beat",count:entries.filter(e=>e.assignmentType==="new").length,color:C.success},{label:"Improvement",count:entries.filter(e=>e.assignmentType==="improvement").length,color:C.warning}]},
              {label:"By Writer",items:writers.map(w=>({label:w,count:entries.filter(e=>e.writer===w).length,color:C.accent}))},
              {label:"By POD Lead",items:pods.map(p=>({label:p,count:entries.filter(e=>e.podLead===p).length,color:C.accent2}))},
              {label:"Grade Distribution",items:GRADES.map(g=>({label:GRADE_SHORT[g],count:entries.filter(e=>e.grade===g).length,color:GRADE_COLOR[g]}))},
            ].map(group=>(
              <div key={group.label} style={card()}>
                <div style={{fontSize:12,color:C.muted,marginBottom:14,fontWeight:600,textTransform:"uppercase",letterSpacing:.8}}>{group.label}</div>
                {group.items.map(item=>(
                  <div key={item.label} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}><span style={{color:item.color}}>{item.label}</span><span>{item.count}</span></div>
                    <div style={{background:"#2a2a3a",borderRadius:4,height:6}}><div style={{width:entries.length?`${(item.count/entries.length)*100}%`:"0%",background:item.color,height:6,borderRadius:4,transition:"width .4s"}}/></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {role==="pod"&&tab==="settings"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {[{title:"Writers",list:writers,setList:setWriters,val:nw,setVal:setNw,ph:"New writer name"},{title:"POD Leads",list:pods,setList:setPods,val:np,setVal:setNp,ph:"New POD lead name"}].map(({title,list,setList,val,setVal,ph})=>(
              <div key={title} style={card()}>
                <div style={{fontWeight:700,marginBottom:16}}>{title}</div>
                {list.map(item=>(<div key={item} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:14}}><span>{item}</span><button onClick={()=>setList(p=>p.filter(x=>x!==item))} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:18}}>×</button></div>))}
                <div style={{display:"flex",gap:8,marginTop:14}}>
                  <input value={val} onChange={e=>setVal(e.target.value)} placeholder={ph} style={{...inp(),flex:1}} onKeyDown={e=>{if(e.key==="Enter"&&val.trim()){setList(p=>[...p,val.trim()]);setVal("");}}}/>
                  <button onClick={()=>{if(val.trim()){setList(p=>[...p,val.trim()]);setVal("");}}} style={btn("linear-gradient(135deg,#7c3aed,#2563eb)")}>Add</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Assign Beat to Writer */}
      {assignBeatModal&&(
        <Modal title={`Assign Beat to Writer — ${assignBeatModal.id}`} onClose={()=>setAssignBeatModal(null)} wide>
          <div style={{background:C.surface2,borderRadius:8,padding:"12px 14px",marginBottom:16}}>
            <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{assignBeatModal.title}</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:8}}>Beat ID: {assignBeatModal.id} · Idea: {assignBeatModal.ideaId} · Beats by: {assignBeatModal.assignedTo}</div>
            {assignBeatModal.docLink&&<a href={assignBeatModal.docLink} target="_blank" rel="noreferrer" style={{fontSize:12,color:C.info,fontWeight:600}}>📄 View Beats Doc →</a>}
          </div>
          <div style={{background:C.surface2,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.muted,marginBottom:16}}>
            Assignment Code: <strong style={{color:"#a78bfa"}}>{padA(aCounter)}</strong>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><Lbl c="CONTENT CODE (GU or GA) *"/><input value={beatAssignForm.editCode} onChange={e=>setBeatAssignForm(f=>({...f,editCode:e.target.value}))} placeholder="e.g. GA1042" style={inp({borderColor:beatAssignForm.editCode&&!isValidEditCode(beatAssignForm.editCode)?C.danger:"#3a3a4a"})}/>{beatAssignForm.editCode&&!isValidEditCode(beatAssignForm.editCode)&&<div style={{color:C.danger,fontSize:12,marginTop:4}}>Must start with GU or GA</div>}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><Lbl c="ASSIGN WRITER *"/><select value={beatAssignForm.writer} onChange={e=>setBeatAssignForm(f=>({...f,writer:e.target.value}))} style={sel()}><option value="">— Select —</option>{writers.map(w=><option key={w}>{w}</option>)}</select></div>
              <div><Lbl c="POD LEAD *"/><select value={beatAssignForm.podLead} onChange={e=>setBeatAssignForm(f=>({...f,podLead:e.target.value}))} style={sel()}><option value="">— Select —</option>{pods.map(p=><option key={p}>{p}</option>)}</select></div>
              <div><Lbl c="DATE OF ASSIGNMENT *"/><input type="date" value={beatAssignForm.dateAssigned} onChange={e=>setBeatAssignForm(f=>({...f,dateAssigned:e.target.value}))} style={inp()}/></div>
              <div><Lbl c="EXPECTED SUBMISSION DATE *"/><input type="date" value={beatAssignForm.dateDue} onChange={e=>setBeatAssignForm(f=>({...f,dateDue:e.target.value}))} style={inp()}/></div>
            </div>
            <div><Lbl c="NOTES / BRIEF FOR WRITER"/><textarea value={beatAssignForm.notes} onChange={e=>setBeatAssignForm(f=>({...f,notes:e.target.value}))} rows={3} style={{...inp(),resize:"vertical"}}/></div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={saveFromBeat} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),flex:1,padding:10}}>Create Assignment</button>
              <button onClick={()=>setAssignBeatModal(null)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"10px 18px"}}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Improvement Assignment */}
      {improvModal&&(
        <Modal title="New Improvement Assignment" onClose={()=>setImprovModal(false)} wide>
          <div style={{background:C.surface2,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.muted,marginBottom:16}}>Assignment Code: <strong style={{color:"#a78bfa"}}>{padA(aCounter)}</strong></div>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><Lbl c="SHOW NAME *"/><select value={improvForm.show} onChange={e=>setImprovForm(f=>({...f,show:e.target.value}))} style={sel()}>{SHOWS.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><Lbl c="CONTENT CODE (GU or GA) *"/><input value={improvForm.editCode} onChange={e=>setImprovForm(f=>({...f,editCode:e.target.value}))} placeholder="e.g. GU2050" style={inp({borderColor:improvForm.editCode&&!isValidEditCode(improvForm.editCode)?C.danger:"#3a3a4a"})}/>{improvForm.editCode&&!isValidEditCode(improvForm.editCode)&&<div style={{color:C.danger,fontSize:12,marginTop:4}}>Must start with GU or GA</div>}</div>
            </div>
            <div><Lbl c="ANGLE NAME *"/><input value={improvForm.angle} onChange={e=>setImprovForm(f=>({...f,angle:e.target.value}))} placeholder="Describe the angle for this improvement…" style={inp()}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><Lbl c="CODE TO BE REWORKED"/><input value={improvForm.codeToRework} onChange={e=>setImprovForm(f=>({...f,codeToRework:e.target.value}))} placeholder="e.g. GA00001" style={inp()}/></div>
              <div><Lbl c="UPDATED BEATS DOC LINK"/><input value={improvForm.updatedBeats} onChange={e=>setImprovForm(f=>({...f,updatedBeats:e.target.value}))} placeholder="https://docs.google.com/…" style={inp()}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><Lbl c="ASSIGN WRITER *"/><select value={improvForm.writer} onChange={e=>setImprovForm(f=>({...f,writer:e.target.value}))} style={sel()}><option value="">— Select —</option>{writers.map(w=><option key={w}>{w}</option>)}</select></div>
              <div><Lbl c="POD LEAD *"/><select value={improvForm.podLead} onChange={e=>setImprovForm(f=>({...f,podLead:e.target.value}))} style={sel()}><option value="">— Select —</option>{pods.map(p=><option key={p}>{p}</option>)}</select></div>
              <div><Lbl c="DATE OF ASSIGNMENT *"/><input type="date" value={improvForm.dateAssigned} onChange={e=>setImprovForm(f=>({...f,dateAssigned:e.target.value}))} style={inp()}/></div>
              <div><Lbl c="EXPECTED SUBMISSION DATE *"/><input type="date" value={improvForm.dateDue} onChange={e=>setImprovForm(f=>({...f,dateDue:e.target.value}))} style={inp()}/></div>
            </div>
            <div><Lbl c="NOTES / BRIEF FOR WRITER"/><textarea value={improvForm.notes} onChange={e=>setImprovForm(f=>({...f,notes:e.target.value}))} rows={3} style={{...inp(),resize:"vertical"}}/></div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={saveImprovement} style={{...btn("linear-gradient(135deg,#f59e0b,#ef4444)"),flex:1,padding:10}}>Create Improvement Assignment</button>
              <button onClick={()=>setImprovModal(false)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"10px 18px"}}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Submit */}
      {submitModal&&(<Modal title={`Submit — ${submitModal.code}`} onClose={()=>setSubmitModal(null)}>
        <div style={{color:C.muted,fontSize:13,marginBottom:8}}>Edit Code: <span style={{color:C.info}}>{submitModal.editCode}</span> · Due: {submitModal.dateDue}</div>
        {submitModal.assignmentType==="improvement"&&(submitModal.codeToRework||submitModal.updatedBeats)&&(
          <div style={{background:C.warning+"11",border:`1px solid ${C.warning}33`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13}}>
            {submitModal.codeToRework&&<div>Reworking: <strong style={{color:C.warning}}>{submitModal.codeToRework}</strong></div>}
            {submitModal.updatedBeats&&<a href={submitModal.updatedBeats} target="_blank" rel="noreferrer" style={{fontSize:12,color:C.info,fontWeight:600}}>📄 Updated Beats →</a>}
          </div>
        )}
        {submitModal.notes&&<div style={{background:C.surface2,borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:14,fontStyle:"italic"}}>"{submitModal.notes}"</div>}
        {submitModal.feedback&&<div style={{background:"#1a2a1a",border:"1px solid #2d5a2d",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:14}}>{submitModal.feedback}</div>}
        <Lbl c="YOUR SUBMISSION *"/>
        <textarea value={subText} onChange={e=>setSubText(e.target.value)} rows={8} style={{...inp(),resize:"vertical",marginBottom:14}}/>
        <div style={{display:"flex",gap:10}}><button onClick={saveSubmit} style={{...btn("linear-gradient(135deg,#059669,#0d9488)"),flex:1,padding:10}}>Submit</button><button onClick={()=>setSubmitModal(null)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"10px 18px"}}>Cancel</button></div>
      </Modal>)}

      {/* MODAL: Grade */}
      {gradeModal&&(<Modal title={`Review — ${gradeModal.code} (${gradeModal.editCode})`} onClose={()=>setGradeModal(null)} wide>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{fontSize:13,color:C.muted}}>{gradeModal.writer}</div>
          <div style={{fontSize:13,color:C.muted,textAlign:"right"}}>Submitted: {gradeModal.tsSubmitted}</div>
        </div>
        <div style={{background:C.surface2,borderRadius:8,padding:"12px 14px",fontSize:13,marginBottom:16,maxHeight:160,overflowY:"auto"}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>WRITER'S SUBMISSION</div>
          <div style={{whiteSpace:"pre-wrap",lineHeight:1.6}}>{gradeModal.submission||"No submission"}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><Lbl c="FINAL EDITED OUTPUT *"/><textarea value={gForm.finalOutput} onChange={e=>setGForm(f=>({...f,finalOutput:e.target.value}))} rows={5} style={{...inp(),resize:"vertical"}}/></div>
          <div><Lbl c="REVIEW GRADE *"/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {GRADES.map(g=>(<label key={g} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 14px",borderRadius:8,border:`1px solid ${gForm.grade===g?GRADE_COLOR[g]:C.border}`,background:gForm.grade===g?GRADE_COLOR[g]+"18":"transparent"}}><input type="radio" name="grade" value={g} checked={gForm.grade===g} onChange={()=>setGForm(f=>({...f,grade:g}))} style={{accentColor:GRADE_COLOR[g]}}/><span style={{fontSize:13,color:gForm.grade===g?GRADE_COLOR[g]:C.text,fontWeight:gForm.grade===g?600:400}}>{g}</span></label>))}
            </div>
            {gForm.grade===GRADES[3]&&<div style={{background:C.danger+"18",border:`1px solid ${C.danger}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.danger,marginTop:10}}>Redo will create a new assignment with a fresh code.</div>}
          </div>
          <div><Lbl c="FEEDBACK"/><textarea value={gForm.feedback} onChange={e=>setGForm(f=>({...f,feedback:e.target.value}))} rows={3} style={{...inp(),resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:10}}><button onClick={saveGrade} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),flex:1,padding:10}}>Submit Review</button><button onClick={()=>setGradeModal(null)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"10px 18px"}}>Cancel</button></div>
        </div>
      </Modal>)}

      {/* MODAL: Production Type */}
      {prodModal&&(<Modal title={`Production Type — ${prodModal.code}`} onClose={()=>setProdModal(null)}>
        <div style={{color:C.muted,fontSize:13,marginBottom:20}}>Select output type to finalise the code prefix.</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {PROD_TYPES.map(pt=>(<label key={pt.suffix} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",padding:"14px 16px",borderRadius:10,border:`1px solid ${prodType===pt.suffix?C.success:C.border}`,background:prodType===pt.suffix?C.success+"15":"transparent"}}><input type="radio" name="prod" value={pt.suffix} checked={prodType===pt.suffix} onChange={()=>setProdType(pt.suffix)} style={{accentColor:C.success}}/><div><div style={{fontWeight:700,color:prodType===pt.suffix?C.success:C.text}}>{pt.label}</div><div style={{fontSize:12,color:C.muted}}>Prefix: <span style={{color:C.info,fontWeight:600}}>{pt.suffix}</span></div></div></label>))}
        </div>
        <div style={{background:C.surface2,borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16,color:C.muted}}>Final code: <span style={{color:"#a78bfa",fontWeight:700}}>{prodType}{prodModal.code}</span></div>
        <div style={{display:"flex",gap:10}}><button onClick={saveProdType} style={{...btn("linear-gradient(135deg,#22c55e,#16a34a)"),flex:1,padding:10}}>Confirm</button><button onClick={()=>setProdModal(null)} style={{...btn(C.surface2),border:`1px solid ${C.border}`,padding:"10px 18px"}}>Cancel</button></div>
      </Modal>)}

      {/* MODAL: View */}
      {viewModal&&(<Modal title={`${viewModal.code} — Full Record`} onClose={()=>setViewModal(null)} wide>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:13}}>
            {[["Edit Code",viewModal.editCode],["Type",viewModal.assignmentType==="improvement"?"Improvement":"New Beat"],["Show",viewModal.show||"—"],["Angle",viewModal.angle||"—"],["Writer",viewModal.writer],["POD Lead",viewModal.podLead],["Date Assigned",viewModal.dateAssigned],["Due Date",viewModal.dateDue],["Code to Rework",viewModal.codeToRework||"—"],["Parent Code",viewModal.parentCode||"—"]].map(([k,v])=>(<div key={k} style={{background:C.surface2,borderRadius:8,padding:"10px 14px"}}><div style={{fontSize:11,color:C.muted,marginBottom:3}}>{k}</div><div style={{fontWeight:600}}>{v}</div></div>))}
          </div>
          {viewModal.updatedBeats&&<a href={viewModal.updatedBeats} target="_blank" rel="noreferrer" style={{fontSize:13,color:C.info,fontWeight:600}}>📄 Updated Beats Doc →</a>}
          <div style={{background:C.surface2,borderRadius:8,padding:"12px 14px"}}><div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600}}>TIMESTAMPS</div><div style={{display:"flex",flexDirection:"column",gap:5}}><TsRow label="Writer submitted at:" value={viewModal.tsSubmitted}/><TsRow label="POD lead submitted at:" value={viewModal.tsReviewed}/><TsRow label="Ready for production at:" value={viewModal.tsProduction}/></div></div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}><Badge status={viewModal.status}/>{viewModal.grade&&<span style={{background:(GRADE_COLOR[viewModal.grade]||C.muted)+"22",color:GRADE_COLOR[viewModal.grade]||C.muted,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{GRADE_SHORT[viewModal.grade]}</span>}{viewModal.prodSuffix&&<span style={{background:C.success+"22",color:C.success,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{viewModal.prodSuffix}</span>}</div>
          {viewModal.notes&&<div style={{background:C.surface2,borderRadius:8,padding:"10px 14px",fontSize:13,fontStyle:"italic"}}>"{viewModal.notes}"</div>}
          {viewModal.submission&&<div style={{background:C.surface2,borderRadius:8,padding:"12px 14px",fontSize:13,maxHeight:160,overflowY:"auto",whiteSpace:"pre-wrap",lineHeight:1.6}}><div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>WRITER'S SUBMISSION</div>{viewModal.submission}</div>}
          {viewModal.finalOutput&&<div style={{background:"#1a1a2e",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",fontSize:13,maxHeight:160,overflowY:"auto",whiteSpace:"pre-wrap",lineHeight:1.6}}><div style={{fontSize:11,color:C.info,marginBottom:6,fontWeight:600}}>FINAL EDITED OUTPUT</div>{viewModal.finalOutput}</div>}
          {viewModal.feedback&&<div style={{background:"#1a2a1a",border:"1px solid #2d5a2d",borderRadius:8,padding:"10px 14px",fontSize:13}}><strong>Feedback:</strong> {viewModal.feedback}</div>}
        </div>
      </Modal>)}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PRODUCTION EDITORIAL WORKSPACE
// ══════════════════════════════════════════════════════════
function ProductionWorkspace({shared,onBack}){
  const {writers,pods,entries} = shared;
  const [role,setRole] = useState(null);
  const [myName,setMyName] = useState("");
  const [filters,setFilters] = useState({code:"",writer:"",podLead:"",prodSuffix:""});
  const [sortCol,setSortCol] = useState("tsProduction");
  const [sortDir,setSortDir] = useState("desc");

  const readyEntries = useMemo(()=>{
    let rows=entries.filter(e=>e.status==="Ready for Production").filter(e=>(!filters.code||e.code.toLowerCase().includes(filters.code.toLowerCase()))&&(!filters.writer||e.writer===filters.writer)&&(!filters.podLead||e.podLead===filters.podLead)&&(!filters.prodSuffix||e.prodSuffix===filters.prodSuffix));
    return [...rows].sort((a,b)=>{let va=a[sortCol]||"",vb=b[sortCol]||"";return sortDir==="asc"?va.localeCompare(vb):vb.localeCompare(va);});
  },[entries,filters,sortCol,sortDir]);

  const toggleSort=col=>{if(sortCol===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortCol(col);setSortDir("asc");}};
  const SortIcon=({col})=><span style={{opacity:.4,fontSize:10}}>{sortCol===col?(sortDir==="asc"?" ↑":" ↓"):" ↕"}</span>;

  const exportCSV=()=>{
    const cols=["Code","Edit Code","Type","Show","Angle","Production Type","Writer","POD Lead","Grade","Writer Submitted At","POD Lead Submitted At","Ready for Production At"];
    const rows=readyEntries.map(e=>[e.code,e.editCode,e.assignmentType,e.show||"",e.angle||"",e.prodSuffix,e.writer,e.podLead,e.grade||"",e.tsSubmitted||"",e.tsReviewed||"",e.tsProduction||""].map(v=>`"${v}"`).join(","));
    const csv=[cols.join(","),...rows].join("\n");
    const a=document.createElement("a");a.href="data:text/csv,"+encodeURIComponent(csv);a.download="production.csv";a.click();
  };

  if(!role) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:440,width:"100%"}}>
        <button onClick={onBack} style={{...btn(C.surface2),border:`1px solid ${C.border}`,marginBottom:32,fontSize:12}}>← Back</button>
        <div style={{fontSize:28,fontWeight:800,marginBottom:6}}>Production Editorial</div>
        <div style={{color:C.muted,marginBottom:28}}>Sign in to continue</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>setRole("pod")} style={{...btn("linear-gradient(135deg,#7c3aed,#2563eb)"),padding:13,fontSize:14,borderRadius:12}}>POD Lead</button>
          <button onClick={()=>setRole("business")} style={{...btn("linear-gradient(135deg,#f59e0b,#ef4444)"),padding:13,fontSize:14,borderRadius:12}}>Business Team</button>
          <div style={card({textAlign:"left"})}>
            <div style={{fontWeight:600,marginBottom:10,fontSize:14}}>Writer</div>
            <select value={myName} onChange={e=>setMyName(e.target.value)} style={sel({marginBottom:10})}><option value="">— Select your name —</option>{writers.map(w=><option key={w}>{w}</option>)}</select>
            <button onClick={()=>{if(myName)setRole("writer");}} disabled={!myName} style={{...btn("linear-gradient(135deg,#2563eb,#1d4ed8)"),width:"100%",padding:10,opacity:myName?1:.4}}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",background:C.bg,color:C.text}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12}}>PE</div>
        <div><div style={{fontWeight:800,fontSize:16}}>Production Editorial</div><div style={{fontSize:11,color:C.muted}}>{role==="pod"?"POD Lead":role==="business"?"Business Team":`Writer — ${myName}`}</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={exportCSV} style={{...btn(C.surface2),border:`1px solid ${C.border}`,fontSize:12}}>Export CSV</button>
          <button onClick={()=>{setRole(null);setMyName("");}} style={{...btn(C.surface2),border:`1px solid ${C.border}`,fontSize:12}}>Switch Role</button>
          <button onClick={onBack} style={{...btn(C.surface2),border:`1px solid ${C.border}`,fontSize:12}}>Home</button>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:24}}>
          <div style={card({padding:18})}><div style={{fontSize:11,color:C.success,marginBottom:6,fontWeight:600}}>READY FOR PRODUCTION</div><div style={{fontSize:34,fontWeight:800}}>{entries.filter(e=>e.status==="Ready for Production").length}</div></div>
          {PROD_TYPES.map(pt=>(<div key={pt.suffix} style={card({padding:18})}><div style={{fontSize:11,color:C.info,marginBottom:6,fontWeight:600}}>{pt.label} ({pt.suffix})</div><div style={{fontSize:34,fontWeight:800}}>{entries.filter(e=>e.prodSuffix===pt.suffix).length}</div></div>))}
        </div>
        <div style={card({padding:14,marginBottom:16})}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
            <input value={filters.code} onChange={e=>setFilters(f=>({...f,code:e.target.value}))} placeholder="Code / Edit Code" style={inp()}/>
            <select value={filters.writer} onChange={e=>setFilters(f=>({...f,writer:e.target.value}))} style={sel()}><option value="">All Writers</option>{writers.map(w=><option key={w}>{w}</option>)}</select>
            <select value={filters.podLead} onChange={e=>setFilters(f=>({...f,podLead:e.target.value}))} style={sel()}><option value="">All POD Leads</option>{pods.map(p=><option key={p}>{p}</option>)}</select>
            <select value={filters.prodSuffix} onChange={e=>setFilters(f=>({...f,prodSuffix:e.target.value}))} style={sel()}><option value="">All Types</option>{PROD_TYPES.map(pt=><option key={pt.suffix} value={pt.suffix}>{pt.label} ({pt.suffix})</option>)}</select>
            <button onClick={()=>setFilters({code:"",writer:"",podLead:"",prodSuffix:""})} style={{...btn(C.surface2),border:`1px solid ${C.border}`}}>Clear</button>
          </div>
        </div>
        {readyEntries.length===0
          ?<div style={{...card(),textAlign:"center",padding:60,color:C.muted}}>{entries.filter(e=>e.status==="Ready for Production").length===0?"No assignments are ready for production yet.":"No results match your filters."}</div>
          :<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>
                {[["code","Code"],["editCode","Edit Code"],["assignmentType","Type"],["prodSuffix","Prod Type"],["show","Show"],["writer","Writer"],["podLead","POD Lead"],["grade","Grade"],["tsSubmitted","Sub'd At"],["tsProduction","Prod At"]].map(([col,lbl])=>(
                  <th key={col} onClick={()=>toggleSort(col)} style={{padding:"11px 12px",textAlign:"left",color:C.muted,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:.8,cursor:"pointer",whiteSpace:"nowrap",userSelect:"none"}}>{lbl}<SortIcon col={col}/></th>
                ))}
              </tr></thead>
              <tbody>
                {readyEntries.map((e,i)=>(
                  <tr key={e.id} style={{borderBottom:i<readyEntries.length-1?`1px solid ${C.border}`:"none"}}
                    onMouseEnter={ev=>ev.currentTarget.style.background=C.surface2}
                    onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                    <td style={{padding:"10px 12px",fontWeight:700,color:"#a78bfa"}}>{e.code}</td>
                    <td style={{padding:"10px 12px",color:C.info,fontSize:12}}>{e.editCode}</td>
                    <td style={{padding:"10px 12px"}}><span style={{background:e.assignmentType==="improvement"?C.warning+"22":C.success+"22",color:e.assignmentType==="improvement"?C.warning:C.success,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{e.assignmentType==="improvement"?"Improvement":"New Beat"}</span></td>
                    <td style={{padding:"10px 12px"}}><span style={{background:C.success+"22",color:C.success,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{e.prodSuffix}</span></td>
                    <td style={{padding:"10px 12px",fontSize:12,color:C.muted}}>{e.show||"—"}</td>
                    <td style={{padding:"10px 12px"}}>{e.writer}</td>
                    <td style={{padding:"10px 12px"}}>{e.podLead}</td>
                    <td style={{padding:"10px 12px"}}>{e.grade?<span style={{color:GRADE_COLOR[e.grade],fontSize:12,fontWeight:600}}>{GRADE_SHORT[e.grade]}</span>:<span style={{color:C.muted}}>—</span>}</td>
                    <td style={{padding:"10px 12px",color:C.muted,fontSize:12,whiteSpace:"nowrap"}}>{e.tsSubmitted||"—"}</td>
                    <td style={{padding:"10px 12px",color:C.success,fontSize:12,whiteSpace:"nowrap"}}>{e.tsProduction||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
        <div style={{marginTop:10,fontSize:12,color:C.muted}}>Showing {readyEntries.length} ready for production</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════════════════
export default function App(){
  const shared = useSharedState();
  const [workspace,setWorkspace] = useState(null);
  if(workspace==="newideas")   return <NewIdeasWorkspace   shared={shared} onBack={()=>setWorkspace(null)}/>;
  if(workspace==="beats")      return <BeatsWorkspace      shared={shared} onBack={()=>setWorkspace(null)}/>;
  if(workspace==="writing")    return <WritingWorkspace    shared={shared} onBack={()=>setWorkspace(null)}/>;
  if(workspace==="production") return <ProductionWorkspace shared={shared} onBack={()=>setWorkspace(null)}/>;
  return(
    <div style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",background:C.bg,color:C.text,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>
      <div style={{marginBottom:48,textAlign:"center"}}>
        <div style={{fontSize:30,fontWeight:800,marginBottom:8}}>Content Workflow</div>
        <div style={{color:C.muted,fontSize:15}}>Select a workspace to get started</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:20,width:"100%",maxWidth:1000}}>
        {[
          {id:"newideas",label:"New Ideas",abbr:"NI",desc:"Submit raw ideas, review them and assign beats directly to writers or POD leads.",grad:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"#7c3aed"},
          {id:"beats",label:"Beats",abbr:"BT",desc:"Full beats lifecycle — assign, submit, approve for script writing or send back for rework.",grad:"linear-gradient(135deg,#0d9488,#059669)",border:"#0d9488"},
          {id:"writing",label:"Writing Assignments",abbr:"WA",desc:"Assign scripts from approved beats, request improvements, review and grade submissions.",grad:"linear-gradient(135deg,#2563eb,#1d4ed8)",border:"#2563eb"},
          {id:"production",label:"Production Editorial",abbr:"PE",desc:"View all assignments cleared for production, filtered by type and team.",grad:"linear-gradient(135deg,#f59e0b,#ef4444)",border:"#f59e0b"},
        ].map(ws=>(
          <button key={ws.id} onClick={()=>setWorkspace(ws.id)}
            style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24,cursor:"pointer",textAlign:"left",transition:"all .2s",outline:"none"}}
            onMouseEnter={ev=>{ev.currentTarget.style.borderColor=ws.border;ev.currentTarget.style.transform="translateY(-3px)";ev.currentTarget.style.boxShadow=`0 8px 32px ${ws.border}33`;}}
            onMouseLeave={ev=>{ev.currentTarget.style.borderColor=C.border;ev.currentTarget.style.transform="none";ev.currentTarget.style.boxShadow="none";}}>
            <div style={{width:48,height:48,borderRadius:12,background:ws.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",marginBottom:16}}>{ws.abbr}</div>
            <div style={{fontWeight:800,fontSize:17,marginBottom:6,color:C.text}}>{ws.label}</div>
            <div style={{color:C.muted,fontSize:13,lineHeight:1.6}}>{ws.desc}</div>
            <div style={{marginTop:16,color:ws.border,fontSize:13,fontWeight:600}}>Enter →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
