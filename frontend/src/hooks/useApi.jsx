import { useMutation, useQueryClient } from "react-query";
import { deleteCampaign, deleteChallenge, deleteMap, postCampaign } from "../util/api";
import { errorToast } from "../util/util";
import { toast } from "react-toastify";

export function invalidateJointQueries(queryClient) {
  queryClient.invalidateQueries(["submission_queue"]);
  queryClient.invalidateQueries(["manage_challenges"]);
}

// ===== DELETE =====
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: (id) => deleteCampaign(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["campaign", id]);
      invalidateJointQueries(queryClient);
      toast.success("Campaign deleted!");
    },
    onError: errorToast,
  });

  return mutate;
}

export function useDeleteMap() {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: (id) => deleteMap(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["map", id]);
      invalidateJointQueries(queryClient);
      toast.success("Map deleted!");
    },
    onError: errorToast,
  });

  return mutate;
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: (id) => deleteChallenge(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries(["challenge", id]);
      invalidateJointQueries(queryClient);
      toast.success("Challenge deleted!");
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
      invalidateJointQueries(queryClient);
      if (onSuccess) onSuccess(response.data);
    },
    onError: errorToast,
  });

  return mutate;
}
