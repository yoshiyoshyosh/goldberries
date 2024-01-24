//Assumes that the challenge has foreign keys fully expanded
// export function getChallengeName(campaign, map, challenge) {
//   const objectiveSuffix = getChallengeObjectiveSuffix(challenge);
//   if (challenge.campaign_id !== null) {
//     return campaign.name + " - " + challenge.description + objectiveSuffix;
//   }
//   const fc = getChallengeFcAddition(challenge);
//   const campaignPre = campaign.name === map.name ? "" : campaign.name + " - ";
//   return campaignPre + map.name + objectiveSuffix + fc;
// }

export function getChallengeFcAddition(challenge) {
  if (challenge.requires_fc) return "[FC]";
  else if (challenge.has_fc) return "[C/FC]";
  else return "[C]";
}
export function getChallengeFcType(challenge) {
  if (challenge.requires_fc) return "Full Clear";
  else if (challenge.has_fc) return "Regular/Full Clear";
  else return "Regular Clear";
}

export function getChallengeObjectiveSuffix(challenge) {
  if (challenge.objective.display_name_suffix === null) return "";
  return " " + challenge.objective.display_name_suffix;
}

export function getChallengeName(challenge) {
  return (
    getChallengeFcType(challenge) + ": " + challenge.objective.name + getChallengeObjectiveSuffix(challenge)
  );
}

export function getDifficultyName(difficulty) {
  let subtierPrefix = difficulty.subtier === null ? "" : difficulty.subtier + " ";
  //capitalize first letter
  subtierPrefix = subtierPrefix.charAt(0).toUpperCase() + subtierPrefix.slice(1);
  return subtierPrefix + difficulty.name;
}

export function getChallengeFlags(challenge) {
  const flags = [];
  if (challenge.requires_fc) flags.push("Requires FC");
  else if (challenge.has_fc) flags.push("Has FC");
  else flags.push("Regular");
  if (challenge.is_arbitrary) flags.push("Arbitrary");
  return flags;
}
