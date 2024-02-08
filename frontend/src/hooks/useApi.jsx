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
} from "../util/api";
import { errorToast } from "../util/util";
import { toast } from "react-toastify";

export function invalidateJointQueries(queryClient) {
  queryClient.invalidateQueries(["submission_queue"]);
  queryClient.invalidateQueries(["manage_challenges"]);
}

// ===== DELETE =====
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

// ===== POST =====
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

export function usePostAccount(onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (account) => postAccount(account),
    onSuccess: (response, account) => {
      queryClient.setQueryData(["account", response.data.id], response.data);
      queryClient.invalidateQueries(["all_accounts"]);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });
}

// ===== GET =====
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
