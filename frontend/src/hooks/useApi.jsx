import { useMutation, useQueryClient } from "react-query";
import {
  deleteCampaign,
  deleteChallenge,
  deleteMap,
  postCampaign,
  postChallenge,
  postMap,
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
  const mutate = useMutation({
    mutationFn: (id) => deleteCampaign(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["campaign", id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Campaign deleted");
    },
    onError: errorToast,
  });

  return mutate;
}

export function useDeleteMap(onSuccess) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: (id) => deleteMap(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["map", id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Map deleted");
    },
    onError: errorToast,
  });

  return mutate;
}

export function useDeleteChallenge(onSuccess) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: (id) => deleteChallenge(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["challenge", id]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response, id);
      else toast.success("Challenge deleted");
    },
    onError: errorToast,
  });

  return mutate;
}

// ===== POST =====
export function usePostCampaign(onSuccess) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: (campaign) => postCampaign(campaign),
    onSuccess: (response, campaign) => {
      queryClient.setQueryData(["campaign", response.data.id], response.data);
      queryClient.invalidateQueries(["all_campaigns"]);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });

  return mutate;
}

export function usePostMap(onSuccess) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: (map) => postMap(map),
    onSuccess: (response, map) => {
      queryClient.setQueryData(["map", response.data.id], response.data);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });

  return mutate;
}

export function usePostChallenge(onSuccess) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: (challenge) => postChallenge(challenge),
    onSuccess: (response, challenge) => {
      queryClient.setQueryData(["challenge", response.data.id], response.data);
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });

  return mutate;
}
