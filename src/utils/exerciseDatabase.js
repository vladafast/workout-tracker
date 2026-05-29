// ══════════════════════════════════════════════════════════════
// FITPULSE — EXERCISE DATABASE v3
// Calisthenics / Street Workout / Bodyweight only
// ~65 exercises with XP weights and hold flags
// ══════════════════════════════════════════════════════════════

export const MUSCLE_INFO = {
  // ── CHEST ──
  pec_major_upper:   { sr: "Pectoralis major (gornji)", en: "Pectoralis major (upper)", group: "Grudi" },
  pec_major_lower:   { sr: "Pectoralis major (donji)",  en: "Pectoralis major (lower)", group: "Grudi" },
  pec_minor:         { sr: "Pectoralis minor",           en: "Pectoralis minor",         group: "Grudi" },
  serratus:          { sr: "Serratus anterior",          en: "Serratus anterior",        group: "Grudi" },
  // ── BACK ──
  lats:              { sr: "Latissimus dorsi",           en: "Latissimus dorsi",         group: "Leđa" },
  trap_upper:        { sr: "Trapezius (gornji)",         en: "Trapezius (upper)",        group: "Leđa" },
  trap_mid:          { sr: "Trapezius (srednji)",        en: "Trapezius (middle)",       group: "Leđa" },
  trap_lower:        { sr: "Trapezius (donji)",          en: "Trapezius (lower)",        group: "Leđa" },
  rhomboids:         { sr: "Rhomboids",                  en: "Rhomboids",                group: "Leđa" },
  teres_major:       { sr: "Teres major",                en: "Teres major",              group: "Leđa" },
  teres_minor:       { sr: "Teres minor",                en: "Teres minor",              group: "Leđa" },
  infraspinatus:     { sr: "Infraspinatus",              en: "Infraspinatus",            group: "Leđa" },
  erector_spinae:    { sr: "Erector spinae",             en: "Erector spinae",           group: "Leđa" },
  // ── SHOULDERS ──
  delt_anterior:     { sr: "Deltoid (prednji)",          en: "Anterior deltoid",         group: "Ramena" },
  delt_lateral:      { sr: "Deltoid (bočni)",            en: "Lateral deltoid",          group: "Ramena" },
  delt_posterior:    { sr: "Deltoid (zadnji)",           en: "Posterior deltoid",        group: "Ramena" },
  // ── ARMS ──
  bicep_long:        { sr: "Biceps (duga glava)",        en: "Biceps (long head)",       group: "Ruke" },
  bicep_short:       { sr: "Biceps (kratka glava)",      en: "Biceps (short head)",      group: "Ruke" },
  brachialis:        { sr: "Brachialis",                 en: "Brachialis",               group: "Ruke" },
  brachioradialis:   { sr: "Brachioradialis",            en: "Brachioradialis",          group: "Ruke" },
  tricep_long:       { sr: "Triceps (duga glava)",       en: "Triceps (long head)",      group: "Ruke" },
  tricep_lateral:    { sr: "Triceps (lateralna)",        en: "Triceps (lateral head)",   group: "Ruke" },
  tricep_medial:     { sr: "Triceps (medijalna)",        en: "Triceps (medial head)",    group: "Ruke" },
  // ── CORE ──
  rectus_abdominis:  { sr: "Rectus abdominis",           en: "Rectus abdominis",         group: "Core" },
  oblique_ext:       { sr: "Obliquus externus",          en: "External oblique",         group: "Core" },
  oblique_int:       { sr: "Obliquus internus",          en: "Internal oblique",         group: "Core" },
  transversus:       { sr: "Transversus abdominis",      en: "Transversus abdominis",    group: "Core" },
  // ── LEGS ──
  rectus_femoris:    { sr: "Rectus femoris",             en: "Rectus femoris",           group: "Noge" },
  vastus_lat:        { sr: "Vastus lateralis",           en: "Vastus lateralis",         group: "Noge" },
  vastus_med:        { sr: "Vastus medialis",            en: "Vastus medialis",          group: "Noge" },
  vastus_int:        { sr: "Vastus intermedius",         en: "Vastus intermedius",       group: "Noge" },
  bicep_femoris:     { sr: "Biceps femoris",             en: "Biceps femoris",           group: "Noge" },
  semitendinosus:    { sr: "Semitendinosus",             en: "Semitendinosus",           group: "Noge" },
  semimembranosus:   { sr: "Semimembranosus",            en: "Semimembranosus",          group: "Noge" },
  glute_max:         { sr: "Gluteus maximus",            en: "Gluteus maximus",          group: "Noge" },
  glute_med:         { sr: "Gluteus medius",             en: "Gluteus medius",           group: "Noge" },
  glute_min:         { sr: "Gluteus minimus",            en: "Gluteus minimus",          group: "Noge" },
  gastrocnemius:     { sr: "Gastrocnemius",              en: "Gastrocnemius",            group: "Noge" },
  soleus:            { sr: "Soleus",                     en: "Soleus",                   group: "Noge" },
  iliopsoas:         { sr: "Iliopsoas",                  en: "Iliopsoas",                group: "Noge" },
};

// ── isHold: true → input treated as seconds, XP = seconds × xpWeight
// ── xpWeight: XP per rep (or XP per second for holds)
// ── difficulty: 1-10 cosmetic label
// ── category: push | pull | dips | legs | core | hold | skill

export const EXERCISE_DB = [

  // ══════════════════════════════════════════════════════════
  // PUSH
  // ══════════════════════════════════════════════════════════
  {
    id: "knee_pushup",
    sr: "Sklekovi na kolenima", en: "Knee Push-Up",
    icon: "🤸", category: "push", difficulty: 1,
    xpWeight: 0.5,
    desc_sr: "Modifikovana verzija skleka za početnike. Kolena na podu, fokus na formi.",
    desc_en: "Beginner push-up variation with knees on the floor.",
    muscles: { primary: ["pec_major_lower"], secondary: ["tricep_lateral","delt_anterior"] },
  },
  {
    id: "sklekovi_siroki",
    sr: "Sklekovi široki", en: "Wide Push-Up",
    icon: "🤸", category: "push", difficulty: 2,
    xpWeight: 1.5,
    desc_sr: "Ruke šire od ramena, naglasak na spoljašnjim grudima.",
    desc_en: "Hands wider than shoulder-width, outer chest emphasis.",
    muscles: { primary: ["pec_major_upper","pec_major_lower"], secondary: ["tricep_long","delt_anterior","serratus"] },
  },
  {
    id: "push_up",
    sr: "Sklekovi", en: "Push-Up",
    icon: "💪", category: "push", difficulty: 2,
    xpWeight: 1.0,
    desc_sr: "Osnovna vežba gornjeg dela tela. Telo u ravnoj liniji.",
    desc_en: "The foundational upper body exercise. Body in a straight line.",
    muscles: { primary: ["pec_major_upper","pec_major_lower"], secondary: ["tricep_long","tricep_lateral","delt_anterior","serratus"] },
  },
  {
    id: "sklekovi_uski",
    sr: "Sklekovi uski", en: "Close Push-Up",
    icon: "🤸", category: "push", difficulty: 3,
    xpWeight: 1.2,
    desc_sr: "Ruke bliže jedna drugoj, veći fokus na triceps.",
    desc_en: "Hands closer together, greater tricep activation.",
    muscles: { primary: ["tricep_long","tricep_lateral","tricep_medial"], secondary: ["pec_major_lower","delt_anterior"] },
  },
  {
    id: "sklekovi_dijamant",
    sr: "Diamond Push-Up", en: "Diamond Push-Up",
    icon: "💎", category: "push", difficulty: 3,
    xpWeight: 1.5,
    desc_sr: "Ruke formiraju dijamant. Maksimalna aktivacija tricepsa.",
    desc_en: "Hands form a diamond shape. Maximum tricep isolation.",
    muscles: { primary: ["tricep_long","tricep_lateral","tricep_medial"], secondary: ["pec_major_lower","delt_anterior"] },
  },
  {
    id: "sklekovi_decline",
    sr: "Sklekovi noge gore", en: "Decline Push-Up",
    icon: "📐", category: "push", difficulty: 4,
    xpWeight: 2.0,
    desc_sr: "Noge podignute, naglasak na gornjem delu grudiju i prednjim deltoidima.",
    desc_en: "Feet elevated, upper chest and anterior delt emphasis.",
    muscles: { primary: ["pec_major_upper","delt_anterior"], secondary: ["tricep_long","serratus"] },
  },
  {
    id: "explosive_pushup",
    sr: "Eksplozivni sklekovi", en: "Explosive Push-Up",
    icon: "💥", category: "push", difficulty: 5,
    xpWeight: 4.0,
    desc_sr: "Maksimalna eksplozivnost — ruke odvajaju od poda u vrhu pokreta.",
    desc_en: "Maximum explosiveness — hands leave the floor at the top.",
    muscles: { primary: ["pec_major_upper","pec_major_lower"], secondary: ["tricep_long","delt_anterior"] },
  },
  {
    id: "sklekovi_archer",
    sr: "Archer Push-Up", en: "Archer Push-Up",
    icon: "🏹", category: "push", difficulty: 6,
    xpWeight: 3.0,
    desc_sr: "Jedna ruka savija, druga ostaje ispružena. Prelaz ka jednoručnom skleku.",
    desc_en: "One arm bends while the other stays extended. Transition to one-arm push-up.",
    muscles: { primary: ["pec_major_upper","pec_major_lower"], secondary: ["tricep_long","delt_anterior","brachialis"] },
  },
  {
    id: "sklekovi_pike",
    sr: "Pike Push-Up", en: "Pike Push-Up",
    icon: "🔺", category: "push", difficulty: 6,
    xpWeight: 3.0,
    desc_sr: "Kuk gore, krećeš se prema podu. Priprema za handstand push-up.",
    desc_en: "Hips up, lower toward the floor. Handstand push-up preparation.",
    muscles: { primary: ["delt_anterior","delt_lateral"], secondary: ["tricep_long","trap_upper","pec_minor"] },
  },
  {
    id: "sklekovi_incline",
    sr: "Sklekovi ruke gore", en: "Incline Push-Up",
    icon: "↗️", category: "push", difficulty: 2,
    xpWeight: 0.8,
    desc_sr: "Ruke na povišenoj površini. Lakša varijacija za početnike.",
    desc_en: "Hands on elevated surface. Easier variation for beginners.",
    muscles: { primary: ["pec_major_lower"], secondary: ["tricep_lateral","delt_anterior"] },
  },
  {
    id: "pseudo_planche_pushup",
    sr: "Pseudo Planche Push-Up", en: "Pseudo Planche Push-Up",
    icon: "⚡", category: "push", difficulty: 8,
    xpWeight: 5.0,
    desc_sr: "Ruke okrenute unazad, telo nagnuto napred. Direktna priprema za planche.",
    desc_en: "Hands rotated back, body leaned forward. Direct planche preparation.",
    muscles: { primary: ["delt_anterior","pec_minor","serratus"], secondary: ["tricep_long","pec_major_lower"] },
  },
  {
    id: "handstand_pushups",
    sr: "Handstand Push-Up", en: "Handstand Push-Up",
    icon: "🤸", category: "push", difficulty: 9,
    xpWeight: 10.0,
    desc_sr: "Sklekovi u handstand poziciji. Elitna vežba za ramena.",
    desc_en: "Push-ups in handstand position. Elite shoulder exercise.",
    muscles: { primary: ["delt_anterior","delt_lateral","trap_upper"], secondary: ["tricep_long","pec_minor","serratus"] },
  },
  {
    id: "sklekovi_jednorucan",
    sr: "Jednoručni sklek", en: "One Arm Push-Up",
    icon: "☝️", category: "push", difficulty: 9,
    xpWeight: 12.0,
    desc_sr: "Jedna ruka iza leđa. Vrhunska unilateralna vežba.",
    desc_en: "One hand behind back. Elite unilateral exercise.",
    muscles: { primary: ["pec_major_upper","pec_major_lower"], secondary: ["tricep_long","oblique_ext","delt_anterior"] },
  },

  // ══════════════════════════════════════════════════════════
  // PULL
  // ══════════════════════════════════════════════════════════
  {
    id: "australijski_zgibovi",
    sr: "Australijski zgibovi", en: "Australian Pull-Up",
    icon: "🦘", category: "pull", difficulty: 2,
    xpWeight: 1.0,
    desc_sr: "Horizontalni zgib. Noge na podu, telo pod uglom.",
    desc_en: "Horizontal pull. Feet on floor, body at angle.",
    muscles: { primary: ["lats","rhomboids","trap_mid"], secondary: ["bicep_long","bicep_short","brachialis","teres_major"] },
  },
  {
    id: "scapular_pulls",
    sr: "Scapular Pull", en: "Scapular Pull",
    icon: "🔧", category: "pull", difficulty: 2,
    xpWeight: 0.8,
    desc_sr: "Aktivacija lopatice na šipki bez savijanja laktova. Osnova za zgibove.",
    desc_en: "Scapular retraction on the bar without elbow bend. Foundation for pull-ups.",
    muscles: { primary: ["trap_lower","rhomboids","serratus"], secondary: ["lats","teres_minor","infraspinatus"] },
  },
  {
    id: "chin_ups",
    sr: "Chin-Up (pothhvat)", en: "Chin-Up",
    icon: "💪", category: "pull", difficulty: 4,
    xpWeight: 3.0,
    desc_sr: "Pothhvat, dlanovi okrenuti ka tebi. Jači naglasak na bicepse.",
    desc_en: "Underhand grip, palms facing you. Greater bicep activation.",
    muscles: { primary: ["bicep_long","bicep_short","lats"], secondary: ["brachialis","rhomboids","trap_mid"] },
  },
  {
    id: "zgibovi_uski",
    sr: "Zgibovi uski", en: "Pull-Up",
    icon: "⬆️", category: "pull", difficulty: 4,
    xpWeight: 4.0,
    desc_sr: "Zahvat na širini ramena, prihvat. Osnovna vežba za leđa.",
    desc_en: "Shoulder-width overhand grip. Foundational back exercise.",
    muscles: { primary: ["lats","teres_major"], secondary: ["bicep_long","rhomboids","trap_mid","brachialis"] },
  },
  {
    id: "neutral_grip_pullups",
    sr: "Neutral zgibovi", en: "Neutral Grip Pull-Up",
    icon: "🤝", category: "pull", difficulty: 4,
    xpWeight: 4.0,
    desc_sr: "Paralelni hvatovi. Neutralan položaj za zglob.",
    desc_en: "Parallel handles. Neutral wrist position.",
    muscles: { primary: ["lats","brachialis"], secondary: ["bicep_long","teres_major","rhomboids"] },
  },
  {
    id: "zgibovi_siroki",
    sr: "Zgibovi široki", en: "Wide Pull-Up",
    icon: "🦅", category: "pull", difficulty: 5,
    xpWeight: 5.0,
    desc_sr: "Hvatanje šire od ramena. Maksimalni stretch latova.",
    desc_en: "Grip wider than shoulders. Maximum lat stretch.",
    muscles: { primary: ["lats","teres_major"], secondary: ["trap_mid","rhomboids","teres_minor","infraspinatus"] },
  },
  {
    id: "archer_pullup",
    sr: "Archer Pull-Up", en: "Archer Pull-Up",
    icon: "🏹", category: "pull", difficulty: 7,
    xpWeight: 7.0,
    desc_sr: "Jedna ruka vodi, druga pomaže. Prelaz ka jednoručnom zgibu.",
    desc_en: "One arm leads, other assists. Transition to one-arm pull-up.",
    muscles: { primary: ["lats","bicep_long"], secondary: ["teres_major","rhomboids","brachialis"] },
  },
  {
    id: "chest_to_bar",
    sr: "Chest-to-Bar Pull-Up", en: "Chest-to-Bar Pull-Up",
    icon: "🎯", category: "pull", difficulty: 7,
    xpWeight: 8.0,
    desc_sr: "Povlačenje sve dok grudi ne dodirnu šipku. Pun raspon pokreta.",
    desc_en: "Pull until chest touches the bar. Full range of motion.",
    muscles: { primary: ["lats","teres_major","rhomboids"], secondary: ["bicep_long","trap_lower","trap_mid"] },
  },
  {
    id: "explosive_pullup",
    sr: "Eksplozivni zgib", en: "Explosive Pull-Up",
    icon: "🚀", category: "pull", difficulty: 8,
    xpWeight: 10.0,
    desc_sr: "Maksimalna eksplozivnost — ruke napuštaju šipku na vrhu.",
    desc_en: "Maximum explosiveness — hands leave the bar at the top.",
    muscles: { primary: ["lats","teres_major"], secondary: ["bicep_long","trap_lower","delt_posterior"] },
  },
  {
    id: "lsit_pullup",
    sr: "L-Sit Pull-Up", en: "L-Sit Pull-Up",
    icon: "🔡", category: "pull", difficulty: 8,
    xpWeight: 12.0,
    desc_sr: "Zgib sa nogama u L poziciji. Kombinuje pull snagu i core stabilnost.",
    desc_en: "Pull-up with legs in L position. Combines pull strength and core stability.",
    muscles: { primary: ["lats","rectus_abdominis","iliopsoas"], secondary: ["bicep_long","teres_major","rectus_femoris"] },
  },
  {
    id: "muscle_up",
    sr: "Muscle-Up", en: "Muscle-Up",
    icon: "🌟", category: "pull", difficulty: 9,
    xpWeight: 15.0,
    desc_sr: "Zgib + propadanje u jednom eksplozivnom pokretu. Skill vežba.",
    desc_en: "Pull-up + dip in one explosive movement. Skill exercise.",
    muscles: { primary: ["lats","teres_major","tricep_long","delt_anterior"], secondary: ["bicep_long","pec_major_lower","rhomboids"] },
  },
  {
    id: "one_arm_pullup",
    sr: "Jednoručni zgib", en: "One Arm Pull-Up",
    icon: "☝️", category: "pull", difficulty: 10,
    xpWeight: 30.0,
    desc_sr: "Vrh calistenic pull snage. Jedna od najtežih vežbi uopšte.",
    desc_en: "The pinnacle of calisthenics pulling strength. One of the hardest exercises.",
    muscles: { primary: ["lats","bicep_long","teres_major"], secondary: ["brachialis","rhomboids","oblique_ext"] },
  },

  // ══════════════════════════════════════════════════════════
  // DIPS
  // ══════════════════════════════════════════════════════════
  {
    id: "propadanja_stolica",
    sr: "Propadanja na stolici", en: "Bench Dip",
    icon: "🪑", category: "dips", difficulty: 2,
    xpWeight: 1.0,
    desc_sr: "Ruke na klupi iza tebe, noge ispružene. Osnova za propadanja.",
    desc_en: "Hands on bench behind you, legs extended. Foundation for dips.",
    muscles: { primary: ["tricep_long","tricep_lateral"], secondary: ["delt_anterior","pec_major_lower"] },
  },
  {
    id: "propadanja",
    sr: "Propadanja", en: "Parallel Bar Dip",
    icon: "⬇️", category: "dips", difficulty: 5,
    xpWeight: 5.0,
    desc_sr: "Između paralelnih šipki. Osnova calistenic push snage.",
    desc_en: "Between parallel bars. Foundation of calisthenics push strength.",
    muscles: { primary: ["tricep_long","pec_major_lower","delt_anterior"], secondary: ["tricep_lateral","pec_minor","serratus"] },
  },
  {
    id: "straight_bar_dip",
    sr: "Straight Bar Dip", en: "Straight Bar Dip",
    icon: "🏋️", category: "dips", difficulty: 5,
    xpWeight: 4.0,
    desc_sr: "Propadanja na ravnoj šipki. Zahteva više balance i stabilnosti.",
    desc_en: "Dips on a straight bar. Requires more balance and stability.",
    muscles: { primary: ["tricep_long","pec_major_lower"], secondary: ["delt_anterior","serratus","pec_minor"] },
  },
  {
    id: "korean_dips",
    sr: "Korean Dip", en: "Korean Dip",
    icon: "🔱", category: "dips", difficulty: 7,
    xpWeight: 8.0,
    desc_sr: "Hvatanje iza leđa, telo seda dole. Izuzetno zahtevno za ramena.",
    desc_en: "Grip behind the back, body lowers down. Extremely demanding for shoulders.",
    muscles: { primary: ["delt_posterior","teres_minor","infraspinatus"], secondary: ["tricep_long","rhomboids"] },
  },
  {
    id: "russian_dip",
    sr: "Russian Dip", en: "Russian Dip",
    icon: "🇷🇺", category: "dips", difficulty: 8,
    xpWeight: 10.0,
    desc_sr: "Spuštanje na podlaktice na šipkama. Priprema za muscle-up.",
    desc_en: "Lowering to forearms on the bars. Muscle-up preparation.",
    muscles: { primary: ["tricep_long","pec_major_lower","delt_anterior"], secondary: ["serratus","pec_minor","trap_lower"] },
  },

  // ══════════════════════════════════════════════════════════
  // LEGS
  // ══════════════════════════════════════════════════════════
  {
    id: "cucnjevi",
    sr: "Čučnjevi", en: "Bodyweight Squat",
    icon: "🦵", category: "legs", difficulty: 1,
    xpWeight: 1.0,
    desc_sr: "Osnova snage donjih ekstremiteta. Puna amplituda pokreta.",
    desc_en: "Foundation of lower body strength. Full range of motion.",
    muscles: { primary: ["rectus_femoris","vastus_lat","vastus_med","vastus_int"], secondary: ["glute_max","glute_med","erector_spinae"] },
  },
  {
    id: "glute_bridge",
    sr: "Glute Bridge", en: "Glute Bridge",
    icon: "🌉", category: "legs", difficulty: 1,
    xpWeight: 1.0,
    desc_sr: "Podizanje kukova sa poda. Izolacija gluteusa.",
    desc_en: "Hip thrust from the floor. Glute isolation.",
    muscles: { primary: ["glute_max","glute_med"], secondary: ["bicep_femoris","semitendinosus","erector_spinae"] },
  },
  {
    id: "lunges",
    sr: "Iskoraci", en: "Lunge",
    icon: "🚶", category: "legs", difficulty: 2,
    xpWeight: 1.5,
    desc_sr: "Korak napred sa spuštanjem kolena. Unilateralna vežba.",
    desc_en: "Step forward and lower the knee. Unilateral exercise.",
    muscles: { primary: ["rectus_femoris","glute_max"], secondary: ["vastus_lat","vastus_med","bicep_femoris"] },
  },
  {
    id: "jump_squat",
    sr: "Skok čučanj", en: "Jump Squat",
    icon: "⬆️", category: "legs", difficulty: 3,
    xpWeight: 2.0,
    desc_sr: "Eksplozivni čučanj sa skokom. Razvija power i eksplozivnost.",
    desc_en: "Explosive squat with jump. Develops power and explosiveness.",
    muscles: { primary: ["rectus_femoris","glute_max","vastus_lat"], secondary: ["gastrocnemius","soleus","glute_med"] },
  },
  {
    id: "bulgarian_split",
    sr: "Bugarski split čučanj", en: "Bulgarian Split Squat",
    icon: "🎯", category: "legs", difficulty: 4,
    xpWeight: 3.0,
    desc_sr: "Zadnja noga na klupi, prednja radi posao. Intenzivna unilateralna vežba.",
    desc_en: "Rear foot elevated, front leg does the work. Intense unilateral exercise.",
    muscles: { primary: ["rectus_femoris","glute_max","glute_med"], secondary: ["vastus_lat","vastus_med","bicep_femoris"] },
  },
  {
    id: "calf_raises",
    sr: "Podizanje na prste", en: "Calf Raise",
    icon: "👣", category: "legs", difficulty: 1,
    xpWeight: 0.5,
    desc_sr: "Podizanje na prste. Izolacija listova.",
    desc_en: "Rising on toes. Calf isolation.",
    muscles: { primary: ["gastrocnemius","soleus"], secondary: [] },
  },
  {
    id: "sissy_squat",
    sr: "Sissy čučanj", en: "Sissy Squat",
    icon: "🔥", category: "legs", difficulty: 6,
    xpWeight: 5.0,
    desc_sr: "Kolena idu napred dok se telo naginje unazad. Ekstremna kvadriceps izolacija.",
    desc_en: "Knees travel forward as body leans back. Extreme quad isolation.",
    muscles: { primary: ["rectus_femoris","vastus_lat","vastus_med"], secondary: ["glute_max","gastrocnemius"] },
  },
  {
    id: "shrimp_squat",
    sr: "Shrimp čučanj", en: "Shrimp Squat",
    icon: "🦐", category: "legs", difficulty: 7,
    xpWeight: 7.0,
    desc_sr: "Jednonožni čučanj sa zadnjom nogom savijenom. Vrhunska kontrola i balans.",
    desc_en: "Single-leg squat with rear leg bent. Superior control and balance.",
    muscles: { primary: ["rectus_femoris","glute_max","vastus_lat"], secondary: ["vastus_med","bicep_femoris","glute_med"] },
  },
  {
    id: "pistol_squat",
    sr: "Pistol čučanj", en: "Pistol Squat",
    icon: "🔫", category: "legs", difficulty: 8,
    xpWeight: 8.0,
    desc_sr: "Jednonožni čučanj do dna sa drugom nogom ispruženom napred. Vrhunac.",
    desc_en: "Single-leg squat to depth with other leg extended forward. The pinnacle.",
    muscles: { primary: ["rectus_femoris","vastus_lat","vastus_med","glute_max"], secondary: ["bicep_femoris","glute_med","soleus"] },
  },
  {
    id: "nordic_curl",
    sr: "Nordic Curl", en: "Nordic Curl",
    icon: "🧊", category: "legs", difficulty: 9,
    xpWeight: 12.0,
    desc_sr: "Ekscentrično spuštanje sa fiksiranim stopalima. Jedna od najtežih hamstring vežbi.",
    desc_en: "Eccentric lowering with feet fixed. One of the hardest hamstring exercises.",
    muscles: { primary: ["bicep_femoris","semitendinosus","semimembranosus"], secondary: ["glute_max","gastrocnemius"] },
  },

  // ══════════════════════════════════════════════════════════
  // CORE (reps)
  // ══════════════════════════════════════════════════════════
  {
    id: "situps",
    sr: "Trbušnjaci", en: "Sit-Up",
    icon: "💪", category: "core", difficulty: 1,
    xpWeight: 1.0,
    desc_sr: "Klasični trbušnjaci. Podiži gornji deo tela sa poda.",
    desc_en: "Classic sit-ups. Raise the upper body off the floor.",
    muscles: { primary: ["rectus_abdominis"], secondary: ["oblique_ext","iliopsoas"] },
  },
  {
    id: "noge_u_vis",
    sr: "Podizanje nogu", en: "Leg Raise",
    icon: "🦵", category: "core", difficulty: 3,
    xpWeight: 2.0,
    desc_sr: "Podizanje ispruženih nogu sa poda. Donji trbuh.",
    desc_en: "Raising straight legs from the floor. Lower abs emphasis.",
    muscles: { primary: ["rectus_abdominis","iliopsoas"], secondary: ["rectus_femoris","transversus"] },
  },
  {
    id: "hanging_knee_raise",
    sr: "Podizanje kolena u visu", en: "Hanging Knee Raise",
    icon: "🔝", category: "core", difficulty: 3,
    xpWeight: 3.0,
    desc_sr: "Privlačenje kolena ka grudima u visu na šipki.",
    desc_en: "Drawing knees to chest while hanging from a bar.",
    muscles: { primary: ["rectus_abdominis","iliopsoas"], secondary: ["oblique_ext","transversus","lats"] },
  },
  {
    id: "hollow_body",
    sr: "Hollow Body Hold", en: "Hollow Body Hold",
    icon: "🌊", category: "core", difficulty: 3,
    xpWeight: 2.0,
    desc_sr: "Osnovna gimnastička pozicija. Ruke i noge podignuti sa poda, leđa sploštena.",
    desc_en: "Fundamental gymnastic position. Arms and legs lifted, lower back flat.",
    muscles: { primary: ["rectus_abdominis","transversus"], secondary: ["oblique_ext","iliopsoas"] },
  },
  {
    id: "hanging_leg_raise",
    sr: "Podizanje nogu u visu", en: "Hanging Leg Raise",
    icon: "⬆️", category: "core", difficulty: 5,
    xpWeight: 5.0,
    desc_sr: "Ispružene noge se podižu do horizontale u visu. Zahteva snagu i kontrolu.",
    desc_en: "Straight legs raised to horizontal while hanging. Requires strength and control.",
    muscles: { primary: ["rectus_abdominis","iliopsoas","rectus_femoris"], secondary: ["lats","oblique_ext","transversus"] },
  },
  {
    id: "ab_wheel",
    sr: "Ab Wheel", en: "Ab Wheel Rollout",
    icon: "⚙️", category: "core", difficulty: 6,
    xpWeight: 6.0,
    desc_sr: "Kotrljanje točkića napred sa ispruženim telom. Intenzivna vežba za ceo core.",
    desc_en: "Rolling the wheel forward with extended body. Intense full core exercise.",
    muscles: { primary: ["rectus_abdominis","transversus"], secondary: ["delt_anterior","serratus","oblique_ext","erector_spinae"] },
  },
  {
    id: "toes_to_bar",
    sr: "Nožni prsti do šipke", en: "Toes to Bar",
    icon: "🎯", category: "core", difficulty: 7,
    xpWeight: 8.0,
    desc_sr: "Podizanje nogu sve do šipke u visu. Pun raspon pokreta.",
    desc_en: "Raising legs all the way to the bar while hanging. Full range of motion.",
    muscles: { primary: ["rectus_abdominis","iliopsoas","lats"], secondary: ["oblique_ext","rectus_femoris","transversus"] },
  },
  {
    id: "windshield_wipers",
    sr: "Brisači za vetrobransko staklo", en: "Windshield Wipers",
    icon: "🌀", category: "core", difficulty: 8,
    xpWeight: 12.0,
    desc_sr: "Noge u horizontali u visu, rotiraju s leve na desnu stranu.",
    desc_en: "Legs at horizontal while hanging, rotating side to side.",
    muscles: { primary: ["oblique_ext","oblique_int","rectus_abdominis"], secondary: ["lats","iliopsoas","transversus"] },
  },
  {
    id: "dragon_flag",
    sr: "Dragon Flag", en: "Dragon Flag",
    icon: "🐲", category: "core", difficulty: 9,
    xpWeight: 15.0,
    desc_sr: "Celo telo u ravnoj liniji, oslonac samo na gornji deo leđa. Legendarni Bruce Lee pokret.",
    desc_en: "Whole body in a straight line, support only on upper back. Bruce Lee's legendary move.",
    muscles: { primary: ["rectus_abdominis","transversus","erector_spinae"], secondary: ["glute_max","iliopsoas","serratus","oblique_ext"] },
  },

  // ══════════════════════════════════════════════════════════
  // STATIC HOLDS (isHold: true, XP per second)
  // ══════════════════════════════════════════════════════════
  {
    id: "plank",
    sr: "Plank", en: "Plank",
    icon: "📏", category: "hold", difficulty: 2,
    isHold: true, xpWeight: 0.3,
    desc_sr: "Osnovna izometricna vežba. Telo u ravnoj liniji, oslonac na laktovima.",
    desc_en: "Foundational isometric exercise. Body straight, supported on forearms.",
    muscles: { primary: ["transversus","rectus_abdominis"], secondary: ["delt_anterior","glute_max","serratus"] },
  },
  {
    id: "side_plank",
    sr: "Bočni plank", en: "Side Plank",
    icon: "📐", category: "hold", difficulty: 3,
    isHold: true, xpWeight: 0.4,
    desc_sr: "Bočna varijanta planka. Fokus na bočnim mišićima trbuha.",
    desc_en: "Side variant of plank. Focus on lateral core muscles.",
    muscles: { primary: ["oblique_ext","oblique_int","transversus"], secondary: ["glute_med","delt_lateral"] },
  },
  {
    id: "dead_hang",
    sr: "Dead Hang", en: "Dead Hang",
    icon: "⚓", category: "hold", difficulty: 2,
    isHold: true, xpWeight: 0.5,
    desc_sr: "Pasivni vis na šipki. Razvija grip snagu i dekomprimuje kičmu.",
    desc_en: "Passive hang from bar. Builds grip strength and decompresses spine.",
    muscles: { primary: ["lats","trap_lower","brachioradialis"], secondary: ["serratus","teres_minor","infraspinatus"] },
  },
  {
    id: "one_arm_hang",
    sr: "Jednoručni hang", en: "One Arm Hang",
    icon: "☝️", category: "hold", difficulty: 6,
    isHold: true, xpWeight: 1.5,
    desc_sr: "Jednoručni pasivni vis. Izuzetna grip snaga i stabilnost ramena.",
    desc_en: "One-arm passive hang. Exceptional grip strength and shoulder stability.",
    muscles: { primary: ["lats","brachioradialis","trap_lower"], secondary: ["teres_minor","infraspinatus","serratus"] },
  },
  {
    id: "l_sit",
    sr: "L-Sit", en: "L-Sit",
    icon: "📐", category: "hold", difficulty: 6,
    isHold: true, xpWeight: 1.0,
    desc_sr: "Noge ispružene horizontalno u visu ili osloncu. Kombinuje core i pull snagu.",
    desc_en: "Legs extended horizontally in hang or support. Combines core and pull strength.",
    muscles: { primary: ["rectus_abdominis","iliopsoas","rectus_femoris"], secondary: ["transversus","lats","tricep_long"] },
  },
  {
    id: "tuck_front_lever",
    sr: "Tuck Front Lever", en: "Tuck Front Lever",
    icon: "🔤", category: "hold", difficulty: 7,
    isHold: true, xpWeight: 1.5,
    desc_sr: "Kolena privučena, telo horizontalno. Priprema za full front lever.",
    desc_en: "Knees tucked, body horizontal. Preparation for full front lever.",
    muscles: { primary: ["lats","teres_major","rectus_abdominis"], secondary: ["rhomboids","trap_lower","bicep_long"] },
  },
  {
    id: "wall_handstand",
    sr: "Handstand uz zid", en: "Wall Handstand Hold",
    icon: "🧱", category: "hold", difficulty: 5,
    isHold: true, xpWeight: 1.5,
    desc_sr: "Handstand sa leđima ili grudima ka zidu. Razvija snagu ramena i balans.",
    desc_en: "Handstand with back or chest to wall. Builds shoulder strength and balance.",
    muscles: { primary: ["delt_anterior","delt_lateral","trap_upper"], secondary: ["serratus","pec_minor","tricep_long"] },
  },
  {
    id: "freestanding_handstand",
    sr: "Freestanding Handstand", en: "Freestanding Handstand",
    icon: "⭐", category: "hold", difficulty: 8,
    isHold: true, xpWeight: 2.5,
    desc_sr: "Handstand bez oslonca. Zahteva mesece treninga balansa i snage.",
    desc_en: "Handstand without support. Requires months of balance and strength training.",
    muscles: { primary: ["delt_anterior","delt_lateral","serratus"], secondary: ["trap_upper","pec_minor","tricep_long","transversus"] },
  },
  {
    id: "back_lever",
    sr: "Back Lever", en: "Back Lever",
    icon: "⬇️", category: "hold", difficulty: 8,
    isHold: true, xpWeight: 3.0,
    desc_sr: "Telo horizontalno ispod šipke, licem nadole. Elitna skill vežba.",
    desc_en: "Body horizontal below the bar, face down. Elite skill exercise.",
    muscles: { primary: ["pec_major_lower","delt_anterior","teres_major"], secondary: ["lats","bicep_long","serratus","erector_spinae"] },
  },
  {
    id: "front_lever",
    sr: "Front Lever", en: "Front Lever",
    icon: "⬆️", category: "hold", difficulty: 9,
    isHold: true, xpWeight: 3.0,
    desc_sr: "Telo horizontalno ispod šipke, licem gore. Jedna od najtežih skill vežbi.",
    desc_en: "Body horizontal below the bar, face up. One of the hardest skill exercises.",
    muscles: { primary: ["lats","teres_major","rectus_abdominis"], secondary: ["rhomboids","trap_lower","bicep_long","iliopsoas"] },
  },
  {
    id: "human_flag",
    sr: "Human Flag", en: "Human Flag",
    icon: "🚩", category: "hold", difficulty: 10,
    isHold: true, xpWeight: 4.0,
    desc_sr: "Horizontalni vis na vertikalnoj šipki. Simbolički pokret street workoutera.",
    desc_en: "Horizontal hold on a vertical pole. Iconic street workout movement.",
    muscles: { primary: ["oblique_ext","oblique_int","lats","delt_lateral"], secondary: ["trap_lower","serratus","glute_med"] },
  },
  {
    id: "tuck_planche",
    sr: "Tuck Planche", en: "Tuck Planche",
    icon: "✈️", category: "hold", difficulty: 8,
    isHold: true, xpWeight: 3.5,
    desc_sr: "Kolena privučena, telo paralelno sa tlom. Priprema za full planche.",
    desc_en: "Knees tucked, body parallel to ground. Preparation for full planche.",
    muscles: { primary: ["delt_anterior","serratus","pec_minor"], secondary: ["tricep_long","rectus_abdominis","transversus"] },
  },
  {
    id: "straddle_planche",
    sr: "Straddle Planche", en: "Straddle Planche",
    icon: "🛸", category: "hold", difficulty: 10,
    isHold: true, xpWeight: 5.0,
    desc_sr: "Noge raširene, telo horizontalno. Korak pre full planche.",
    desc_en: "Legs straddled, body horizontal. Step before full planche.",
    muscles: { primary: ["delt_anterior","serratus","pec_minor","tricep_long"], secondary: ["rectus_abdominis","transversus","glute_med"] },
  },
  {
    id: "full_planche",
    sr: "Full Planche", en: "Full Planche",
    icon: "🌌", category: "hold", difficulty: 10,
    isHold: true, xpWeight: 8.0,
    desc_sr: "Noge zajedno, telo horizontalno. Vrh calistenic skill snage.",
    desc_en: "Legs together, body horizontal. The apex of calisthenics skill strength.",
    muscles: { primary: ["delt_anterior","serratus","pec_minor","tricep_long"], secondary: ["rectus_abdominis","transversus","glute_max"] },
  },
  {
    id: "victorian_hold",
    sr: "Victorian Hold", en: "Victorian Hold",
    icon: "👑", category: "hold", difficulty: 10,
    isHold: true, xpWeight: 12.0,
    desc_sr: "Telo horizontalno iznad šipki, licem gore — bez oslonca na laktove. Prestiž.",
    desc_en: "Body horizontal above bars, face up — no elbow support. Pure prestige.",
    muscles: { primary: ["delt_posterior","teres_minor","infraspinatus"], secondary: ["tricep_long","lats","rhomboids"] },
  },

  // ══════════════════════════════════════════════════════════
  // SKILL / MISC
  // ══════════════════════════════════════════════════════════
  {
    id: "skin_the_cat",
    sr: "Skin the Cat", en: "Skin the Cat",
    icon: "🌀", category: "skill", difficulty: 6,
    xpWeight: 6.0,
    desc_sr: "Rotacija tela kroz šipku u visu. Mobilnost ramena i kontrola.",
    desc_en: "Body rotation through the bar while hanging. Shoulder mobility and control.",
    muscles: { primary: ["lats","teres_major","serratus"], secondary: ["pec_minor","teres_minor","rectus_abdominis"] },
  },
  {
    id: "back_lever_swing",
    sr: "Back Lever Swing", en: "Back Lever Swing",
    icon: "🔄", category: "skill", difficulty: 5,
    xpWeight: 4.0,
    desc_sr: "Dinamičan ulazak u back lever poziciju kroz zamah.",
    desc_en: "Dynamic entry into back lever position through a swing.",
    muscles: { primary: ["lats","teres_major","pec_major_lower"], secondary: ["delt_anterior","erector_spinae"] },
  },
  {
    id: "burpees",
    sr: "Burpees", en: "Burpees",
    icon: "💥", category: "skill", difficulty: 4,
    xpWeight: 2.5,
    desc_sr: "Kompleksna vežba: sklekovi + skok. Kondicioniranje celog tela.",
    desc_en: "Complex exercise: push-up + jump. Full body conditioning.",
    muscles: { primary: ["pec_major_lower","rectus_femoris","glute_max"], secondary: ["tricep_long","delt_anterior","gastrocnemius","rectus_abdominis"] },
  },
  {
    id: "mountain_climbers",
    sr: "Mountain Climbers", en: "Mountain Climbers",
    icon: "🧗", category: "skill", difficulty: 3,
    xpWeight: 1.5,
    desc_sr: "Naizmenično privlačenje kolena u položaju skleka. Kardio + core.",
    desc_en: "Alternately drawing knees to chest in push-up position. Cardio + core.",
    muscles: { primary: ["rectus_abdominis","iliopsoas","rectus_femoris"], secondary: ["delt_anterior","transversus","pec_major_lower"] },
  },
];

// ── Search ─────────────────────────────────────────────────
export const searchExercises = (query, lang = "sr") => {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  const ALIASES = {
    "biceps": ["bicep_long","bicep_short","brachialis"],
    "bicepsi": ["bicep_long","bicep_short","brachialis"],
    "triceps": ["tricep_long","tricep_lateral","tricep_medial"],
    "tricepsi": ["tricep_long","tricep_lateral","tricep_medial"],
    "leđa": ["lats","teres_major","teres_minor","trap_upper","trap_mid","trap_lower","erector_spinae"],
    "ledja": ["lats","teres_major","teres_minor","trap_upper","trap_mid","trap_lower","erector_spinae"],
    "lat": ["lats","teres_major","teres_minor"],
    "lats": ["lats","teres_major","teres_minor"],
    "grudi": ["pec_major_upper","pec_major_lower","pec_minor","serratus"],
    "chest": ["pec_major_upper","pec_major_lower"],
    "pektorali": ["pec_major_upper","pec_major_lower"],
    "ramena": ["delt_anterior","delt_posterior","delt_lateral"],
    "rame": ["delt_anterior","delt_posterior","delt_lateral"],
    "deltoid": ["delt_anterior","delt_posterior","delt_lateral"],
    "shoulders": ["delt_anterior","delt_posterior","delt_lateral"],
    "trapez": ["trap_upper","trap_mid","trap_lower"],
    "traps": ["trap_upper","trap_mid","trap_lower"],
    "trbuh": ["rectus_abdominis","transversus","oblique_ext","oblique_int"],
    "abs": ["rectus_abdominis","transversus","oblique_ext","oblique_int"],
    "trbušnjaci": ["rectus_abdominis","transversus","oblique_ext","oblique_int"],
    "core": ["rectus_abdominis","transversus","oblique_ext","oblique_int"],
    "oblici": ["oblique_ext","oblique_int"],
    "obliques": ["oblique_ext","oblique_int"],
    "noge": ["rectus_femoris","vastus_lat","vastus_med","vastus_int","bicep_femoris","semitendinosus","semimembranosus","glute_max","glute_med","gastrocnemius","soleus"],
    "kvadricepsi": ["rectus_femoris","vastus_lat","vastus_med","vastus_int"],
    "quads": ["rectus_femoris","vastus_lat","vastus_med","vastus_int"],
    "zadnja loža": ["bicep_femoris","semitendinosus","semimembranosus"],
    "hamstrings": ["bicep_femoris","semitendinosus","semimembranosus"],
    "gluteusi": ["glute_max","glute_med","glute_min"],
    "glutes": ["glute_max","glute_med","glute_min"],
    "zadnjica": ["glute_max","glute_med","glute_min"],
    "listovi": ["gastrocnemius","soleus"],
    "calves": ["gastrocnemius","soleus"],
    "podlaktice": ["brachioradialis"],
    "forearms": ["brachioradialis"],
    "holds": [],
    "skill": [],
  };

  let targetIds = ALIASES[q];

  // Special category filters
  if (q === "holds" || q === "hold" || q === "statika" || q === "static") {
    return EXERCISE_DB.filter(ex => ex.isHold);
  }
  if (q === "skill" || q === "skills" || q === "veštine") {
    return EXERCISE_DB.filter(ex => ex.category === "skill");
  }
  if (q === "push" || q === "sklekovi" || q === "guranje") {
    return EXERCISE_DB.filter(ex => ex.category === "push");
  }
  if (q === "pull" || q === "zgibovi" || q === "vlacenje") {
    return EXERCISE_DB.filter(ex => ex.category === "pull");
  }
  if (q === "dips" || q === "propadanja") {
    return EXERCISE_DB.filter(ex => ex.category === "dips");
  }
  if (q === "legs" || q === "noge" || q === "noga") {
    return EXERCISE_DB.filter(ex => ex.category === "legs");
  }
  if (q === "core" || q === "trbuh") {
    return EXERCISE_DB.filter(ex => ex.category === "core");
  }

  if (targetIds && targetIds.length > 0) {
    const matched = EXERCISE_DB.filter(ex =>
      targetIds.some(id => ex.muscles.primary.includes(id) || ex.muscles.secondary.includes(id))
    );
    matched.sort((a, b) => {
      const aPri = targetIds.filter(id => a.muscles.primary.includes(id)).length;
      const bPri = targetIds.filter(id => b.muscles.primary.includes(id)).length;
      if (bPri !== aPri) return bPri - aPri;
      return (b.muscles.primary.length + b.muscles.secondary.length) - (a.muscles.primary.length + a.muscles.secondary.length);
    });
    return matched;
  }

  return EXERCISE_DB.filter(ex => {
    const name = lang === "sr" ? ex.sr : ex.en;
    return name.toLowerCase().includes(q) ||
      ex.id.includes(q.replace(/\s/g, "_")) ||
      ex.category.includes(q) ||
      ex.muscles.primary.some(m => MUSCLE_INFO[m]?.[lang]?.toLowerCase().includes(q)) ||
      ex.muscles.secondary.some(m => MUSCLE_INFO[m]?.[lang]?.toLowerCase().includes(q));
  });
};

export const getExerciseById = (id) => EXERCISE_DB.find(ex => ex.id === id);
