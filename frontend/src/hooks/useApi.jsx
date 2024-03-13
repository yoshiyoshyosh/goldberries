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
  return query.data?.data ?? query.data;
}

//#region ===== DELETE =====
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
//#endregion

//#region ===== POST =====
export function usePostCampaign(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaign) => postCampaign(campaign),
    onSuccess: (response, campaign) => {
      queryClient.setQueryData(["campaign", response.data.id], response.data);
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
      queryClient.setQueryData(["map", response.data.id], response.data);
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
      queryClient.setQueryData(["challenge", response.data.id], response.data);
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
      queryClient.setQueryData(["submission", response.data.id], response.data);
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
      queryClient.setQueryData(["account", response.data.id], response.data);
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
//#endregion

//#region ===== GET =====
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

export function useGetChallenge(id) {
  return useQuery({
    queryKey: ["challenge", id],
    queryFn: () => fetchChallenge(id),
    onError: errorToast,
  });
}

export function useGetSubmission(id) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmission(id),
    onError: errorToast,
  });
}

export function useGetPlayer(id) {
  return useQuery({
    queryKey: ["player", id],
    queryFn: () => fetchPlayer(id),
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
//#endregion
