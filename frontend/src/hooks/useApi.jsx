import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  deleteCampaign,
  deleteChallenge,
  deleteMap,
  fetchAccount,
  fetchAllAccounts,
  postCampaign,
  postChallenge,
  postMap,
  postAccount,
  fetchAllPlayers,
  fetchAllPlayerClaims,
  fetchOverallStats,
  postSubmission,
  fetchRecentSubmissions,
  deleteSubmission,
  fetchSubmission,
  fetchCampaign,
  fetchChallenge,
  fetchMap,
  fetchPlayer,
  fetchPlayerStats,
  fetchAllDifficulties,
  fetchCampaignView,
  deleteAccount,
  deleteOwnAccount,
  claimPlayer,
  fetchChangelog,
  registerEmail,
  forgotPasswordRequest,
  forgotPasswordVerify,
  verifyEmail,
  fetchSearch,
  fetchSubmissionQueue,
  fetchRejectedMapList,
  fetchPlayerList,
  postPlayer,
  deleteChangelogEntry,
  fetchLogs,
  deleteLogEntry,
  deletePlayer,
  fetchSuggestions,
  postSuggestion,
  postSuggestionVote,
  deleteSuggestion,
  deleteSuggestionVote,
  fetchSuggestion,
  fetchGoldenList,
} from "../util/api";
import { errorToast } from "../util/util";
import { toast } from "react-toastify";

export function invalidateJointQueries(queryClient) {
  queryClient.invalidateQueries(["submission_queue"]);
  queryClient.invalidateQueries(["manage_challenges"]);
  queryClient.invalidateQueries(["overall_stats"]);
  queryClient.invalidateQueries(["recent_submissions"]);
}

export function getQueryData(query) {
  return query.data?.data ?? query.data ?? null;
}

//#region == GET ==
export function useGetGoldenList(type, id = null, include_archived = false, include_arbitrary = false) {
  return useQuery({
    queryKey: ["goldenList", type, id, include_arbitrary, include_archived],
    queryFn: () =>
      fetchGoldenList(type, id, { include_arbitrary: include_arbitrary, include_archived: include_archived }),
    onError: errorToast,
    cacheTime: type === "hard" || type === "standard" || type === null ? 0 : 60 * 1000,
    staleTime: type === "hard" || type === "standard" || type === null ? 0 : 60 * 1000,
  });
}

export function useGetAllPlayerClaims() {
  return useQuery({
    queryKey: ["accounts_player_claims"],
    queryFn: () => fetchAllPlayerClaims(),
    onError: errorToast,
  });
}

export function useGetAllAccounts() {
  return useQuery({
    queryKey: ["all_accounts"],
    queryFn: () => fetchAllAccounts(),
    onError: errorToast,
  });
}

export function useGetAccount(id, props = {}) {
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => fetchAccount(id),
    onError: errorToast,
    ...props,
  });
}

export function useGetAllPlayers() {
  return useQuery({
    queryKey: ["all_players"],
    queryFn: () => fetchAllPlayers(),
    onError: errorToast,
  });
}

export function useGetOverallStats(verifier = false) {
  return useQuery({
    queryKey: ["overall_stats", verifier ? "verifier" : "overall"],
    queryFn: () => fetchOverallStats(verifier),
    onError: errorToast,
  });
}

export function useGetPlayerStats(id) {
  return useQuery({
    queryKey: ["player_stats", id],
    queryFn: () => fetchPlayerStats(id),
    onError: errorToast,
  });
}

export function useGetCampaign(id) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => fetchCampaign(id),
    onError: errorToast,
  });
}

export function useGetCampaignView(id, include_archived = false) {
  return useQuery({
    queryKey: ["campaign_view", id, include_archived],
    queryFn: () => fetchCampaignView(id, include_archived),
    onError: errorToast,
  });
}

export function useGetMap(id) {
  return useQuery({
    queryKey: ["map", id],
    queryFn: () => fetchMap(id),
    onError: errorToast,
  });
}

export function useGetRejectedMapList() {
  return useQuery({
    queryKey: ["rejected_map_list"],
    queryFn: () => fetchRejectedMapList(),
    onError: errorToast,
  });
}

export function useGetChallenge(id) {
  return useQuery({
    queryKey: ["challenge", id],
    queryFn: () => fetchChallenge(id),
    onError: errorToast,
    enabled: !!id,
  });
}

export function useGetSubmission(id) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmission(id),
    onError: errorToast,
  });
}

export function useGetSubmissionQueue() {
  return useQuery({
    queryKey: ["submission_queue"],
    queryFn: () => fetchSubmissionQueue(),
    onError: errorToast,
    refetchInterval: 5 * 1000,
  });
}

export function useGetPlayer(id) {
  return useQuery({
    queryKey: ["player", id],
    queryFn: () => fetchPlayer(id),
    onError: errorToast,
  });
}

export function useGetVerifierList() {
  return useQuery({
    queryKey: ["player_list", "verifier"],
    queryFn: () => fetchPlayerList("verifier"),
    onError: errorToast,
  });
}

export function useGetChangelog(type, id) {
  return useQuery({
    queryKey: ["change_log", type, id],
    queryFn: () => fetchChangelog(type, id),
    onError: errorToast,
  });
}

export function useGetRecentSubmissions(type, page, perPage, search = null, playerId = null) {
  return useQuery({
    queryKey: ["recent_submissions", type, page, perPage, search, playerId],
    queryFn: () => fetchRecentSubmissions(type, page, perPage, search, playerId),
    onError: errorToast,
  });
}

export function useGetAllDifficulties() {
  return useQuery({
    queryKey: ["all_difficulties"],
    queryFn: () => fetchAllDifficulties(),
    onError: errorToast,
  });
}

export function useSearch(search) {
  return useQuery({
    queryKey: ["search", search],
    queryFn: () => fetchSearch(search),
    onError: errorToast,
  });
}

export function useGetLogs(page, perPage, level, topic, search, start_date, end_date) {
  return useQuery({
    queryKey: ["logs", page, perPage, level, topic, search, start_date, end_date],
    queryFn: () => fetchLogs(page, perPage, level, topic, search, start_date, end_date),
    onError: errorToast,
  });
}

export function useGetSuggestions(page, perPage, expired = null, challengeId = null) {
  return useQuery({
    queryKey: ["suggestions", page, perPage, expired, challengeId],
    queryFn: () => fetchSuggestions(page, perPage, expired, challengeId),
    onError: errorToast,
    refetchInterval: 15 * 1000,
  });
}
export function useGetSuggestion(id) {
  return useQuery({
    queryKey: ["suggestion", id],
    queryFn: () => fetchSuggestion(id),
    onError: errorToast,
    refetchInterval: 5 * 1000,
  });
}
//#endregion

//#region == POST ==
export function usePostCampaign(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaign) => postCampaign(campaign),
    onSuccess: (response, campaign) => {
      queryClient.invalidateQueries(["campaign", response.data.id]);
      queryClient.invalidateQueries(["all_campaigns"]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function usePostMap(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (map) => postMap(map),
    onSuccess: (response, map) => {
      queryClient.invalidateQueries(["map", response.data.id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function usePostChallenge(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challenge) => postChallenge(challenge),
    onSuccess: (response, challenge) => {
      queryClient.invalidateQueries(["challenge", response.data.id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function usePostSubmission(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submission) => postSubmission(submission),
    onSuccess: (response, submission) => {
      queryClient.invalidateQueries(["recent_submissions"]);
      queryClient.invalidateQueries(["submission", response.data.id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function usePostAccount(onSuccess, self = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (account) => postAccount(self, account),
    onSuccess: (response, account) => {
      queryClient.invalidateQueries(["account", response.data.id]);
      queryClient.invalidateQueries(["all_accounts"]);
      queryClient.invalidateQueries(["accounts_player_claims"]);
      queryClient.invalidateQueries(["overall_stats", "verifier"]);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function useClaimPlayer(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (player) => claimPlayer(player),
    onSuccess: (response, player) => {
      queryClient.invalidateQueries(["accounts_player_claims"]);
      queryClient.invalidateQueries(["overall_stats", "verifier"]);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function usePostPlayer(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (player) => postPlayer(player),
    onSuccess: (response, player) => {
      queryClient.invalidateQueries(["all_players"]);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function usePostPlayerSelf(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (player) => postPlayer(player, true),
    onSuccess: (response, player) => {
      queryClient.invalidateQueries(["all_players"]);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function useRegister(onSuccess) {
  return useMutation({
    mutationFn: (data) => registerEmail(data),
    onSuccess: (response, data) => {
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}
export function useVerifyEmail(onSuccess) {
  return useMutation({
    mutationFn: (token) => verifyEmail(token),
    onSuccess: (response, token) => {
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function useForgotPasswordRequest(onSuccess) {
  return useMutation({
    mutationFn: (data) => forgotPasswordRequest(data),
    onSuccess: (response, data) => {
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function useForgotPasswordVerify(onSuccess) {
  return useMutation({
    mutationFn: (data) => forgotPasswordVerify(data),
    onSuccess: (response, data) => {
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

export function usePostSuggestion(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => postSuggestion(data),
    onSuccess: (response, data) => {
      queryClient.invalidateQueries(["suggestions"]);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}
export function usePostSuggestionVote(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => postSuggestionVote(data),
    onSuccess: (response, data) => {
      queryClient.invalidateQueries(["suggestion"]);
      queryClient.invalidateQueries(["suggestions"]);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}
//#endregion

//#region == DELETE ==
export function useDeleteCampaign(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCampaign(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["campaign", id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Campaign deleted");
    },
    onError: errorToast,
  });
}

export function useDeleteMap(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteMap(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["map", id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Map deleted");
    },
    onError: errorToast,
  });
}

export function useDeleteChallenge(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteChallenge(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["challenge", id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Challenge deleted");
    },
    onError: errorToast,
  });
}

export function useDeleteSubmission(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSubmission(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["submission", id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Submission deleted");
    },
    onError: errorToast,
  });
}

export function useDeletePlayer(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePlayer(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["player", id]);
      queryClient.invalidateQueries(["all_players"]);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Player deleted");
    },
    onError: errorToast,
  });
}

export function useDeleteChangelogEntry(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteChangelogEntry(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["change_log"]);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Changelog entry deleted");
    },
    onError: errorToast,
  });
}

export function useDeleteAccount(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteAccount(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["account", id]);
      queryClient.invalidateQueries(["all_accounts"]);
      queryClient.invalidateQueries(["accounts_player_claims"]);
      queryClient.invalidateQueries(["overall_stats", "verifier"]);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Account deleted");
    },
    onError: errorToast,
  });
}
export function useDeleteOwnAccount(onSuccess) {
  return useMutation({
    mutationFn: () => deleteOwnAccount(),
    onSuccess: (response) => {
      if (onSuccess) onSuccess(response);
      else toast.success("Account deleted");
    },
    onError: errorToast,
  });
}

export function useDeleteLogEntry(onSuccess) {
  return useMutation({
    mutationFn: (id) => deleteLogEntry(id),
    onSuccess: (response) => {
      if (onSuccess) onSuccess(response);
      else toast.success("Log entry deleted");
    },
    onError: errorToast,
  });
}

export function useDeleteSuggestion(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSuggestion(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["suggestion", id]);
      queryClient.invalidateQueries(["suggestions"]);
      if (onSuccess) onSuccess(response);
      else toast.success("Suggestion deleted");
    },
    onError: errorToast,
  });
}
export function useDeleteSuggestionVote(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSuggestionVote(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["suggestion"]);
      queryClient.invalidateQueries(["suggestions"]);
      if (onSuccess) onSuccess(response);
      else toast.success("Vote deleted");
    },
    onError: errorToast,
  });
}
//#endregion
