import { useNavigate, useParams } from "react-router-dom";
import {
  BasicContainerBox,
  CustomIconButton,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
} from "../../components/BasicComponents";
import {
  Autocomplete,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  getQueryData,
  useDeleteBadge,
  useDeleteBadgePlayer,
  useDeletePlayer,
  useGetAllAccounts,
  useGetAllPlayerClaims,
  useGetAllPlayers,
  useGetBadgePlayers,
  useGetBadges,
  usePostAccount,
  usePostBadgePlayer,
  usePostPlayer,
} from "../../hooks/useApi";
import { getAccountName } from "../../util/data_util";
import { useEffect, useState } from "react";
import { FormAccountWrapper } from "../../components/forms/Account";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/AuthProvider";
import { Controller, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { Badge } from "../../components/Badge";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { FormBadgeWrapper } from "../../components/forms/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { PlayerChip, PlayerSelect } from "../../components/GoldberriesComponents";

export function PageManageBadges({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.badges" });
  const navigate = useNavigate();

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <Typography variant="h4">{t("title")}</Typography>
      <ManageBadges />
    </BasicContainerBox>
  );
}

function ManageBadges() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.badges" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const navigate = useNavigate();
  const query = useGetBadges();

  const modalRefs = {
    edit: useModal(),
    assign: useModal(),
    delete: useModal(),
  };

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const badges = getQueryData(query);
  //Sort by ID
  // badges.sort((a, b) => a.id - b.id);

  //Sort by title (natural sort), then by flags (integer)
  var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  badges.sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    const titleComparison = collator.compare(titleA, titleB);
    if (titleComparison !== 0) {
      return titleComparison; // Sort by title if they are not equal
    }
    return a.flags - b.flags; // Sort by flags if titles are equal
  });

  return (
    <Stack direction="column">
      <Stack direction="row">
        <Button
          variant="contained"
          color="primary"
          startIcon={<FontAwesomeIcon icon={faPlus} size="sm" />}
          onClick={() => modalRefs.edit.current.open({ id: null })}
        >
          {t("buttons.create")}
        </Button>
      </Stack>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* <TableCell width={1} align="center">
                {t_g("id")}
              </TableCell> */}
              <TableCell width={1} align="center">
                {t_g("badge", { count: 1 })}
              </TableCell>
              <TableCell>{t("table_title")}</TableCell>
              <TableCell width={1} align="center">
                {t("actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {badges.map((badge) => (
              <TableRow key={badge.id}>
                {/* <TableCell width={1} align="center">
                  {badge.id}
                </TableCell> */}
                <TableCell width={1}>
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <Badge badge={badge} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ textWrap: "nowrap" }}>{badge.title}</TableCell>
                <TableCell width={1}>
                  <Stack direction="row" gap={1} flexWrap="nowrap">
                    <ButtonGroup>
                      <CustomIconButton
                        variant="contained"
                        color="primary"
                        onClick={() => modalRefs.edit.current.open({ id: badge.id })}
                      >
                        <FontAwesomeIcon icon={faEdit} size="lg" />
                      </CustomIconButton>
                      <CustomIconButton
                        variant="contained"
                        color="primary"
                        onClick={() => modalRefs.assign.current.open(badge)}
                      >
                        <FontAwesomeIcon icon={faUserPlus} size="lg" />
                      </CustomIconButton>
                      <CustomIconButton
                        variant="outlined"
                        color="error"
                        onClick={() => modalRefs.delete.current.open({ id: badge.id, badge: badge })}
                      >
                        <FontAwesomeIcon icon={faTrash} size="lg" />
                      </CustomIconButton>
                    </ButtonGroup>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ManageModalContainer modalRefs={modalRefs} />
    </Stack>
  );
}

function ManageModalContainer({ modalRefs }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.badges.modals" });
  const { mutate: deleteBadge } = useDeleteBadge();

  const editBadgeModal = useModal();
  const assignBadgeModal = useModal();
  const deleteBadgeModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteBadge(data.id);
  });

  // Setting the refs
  modalRefs.edit.current = editBadgeModal;
  modalRefs.assign.current = assignBadgeModal;
  modalRefs.delete.current = deleteBadgeModal;

  return (
    <>
      <CustomModal modalHook={editBadgeModal} options={{ hideFooter: true }}>
        {editBadgeModal.data === null ? (
          <LoadingSpinner />
        ) : (
          <FormBadgeWrapper id={editBadgeModal.data?.id} onSave={editBadgeModal.close} />
        )}
      </CustomModal>
      <CustomModal
        modalHook={deleteBadgeModal}
        options={{ title: t("delete_badge.title") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">
          <Trans
            i18nKey="manage.badges.modals.delete_badge.description"
            values={{ name: deleteBadgeModal.data?.badge.title ?? "" }}
          />
        </Typography>
      </CustomModal>
      <CustomModal modalHook={assignBadgeModal} options={{ hideFooter: true }}>
        {editBadgeModal.data === null ? (
          <LoadingSpinner />
        ) : (
          <AssignPlayersModal badge={assignBadgeModal.data} onSave={assignBadgeModal.close} />
        )}
      </CustomModal>
    </>
  );
}

function AssignPlayersModal({ badge }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.badges.modals.assign" });
  const [player, setPlayer] = useState(null);

  const { mutate: postBadgePlayer } = usePostBadgePlayer();
  const query = useGetBadgePlayers(badge.id);
  const badgePlayers = getQueryData(query);

  const addPlayer = () => {
    //Add player here
    if (player === null) return;
    postBadgePlayer({ badge_id: badge.id, player_id: player.id });
  };

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Typography variant="h6">{t("title")}</Typography>
        <Badge badge={badge} />
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <PlayerSelect type="all" value={player} onChange={(e, v) => setPlayer(v)} />
        </Grid>
        <Grid item xs={12} sm={6} display="flex" alignItems="stretch">
          <CustomIconButton onClick={addPlayer}>
            <FontAwesomeIcon icon={faUserPlus} size="lg" />
          </CustomIconButton>
        </Grid>
      </Grid>

      <Divider sx={{ my: 0 }} />

      <Typography variant="h6">
        {t("players", { count: badgePlayers ? badgePlayers.length : "?" })}
      </Typography>
      <AssignPlayersList badge={badge} badgePlayers={badgePlayers} />
    </Stack>
  );
}

function AssignPlayersList({ badge, badgePlayers }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.badges.modals.assign" });
  const { mutate: deleteBadgePlayer } = useDeleteBadgePlayer();

  const onDelete = (badgePlayer) => {
    deleteBadgePlayer({ id: badgePlayer.id, badgeId: badge.id });
  };

  if (badgePlayers === null) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell width={1} align="center" sx={{ textWrap: "nowrap" }}>
                {t("remove")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {badgePlayers.map((badgePlayer) => (
              <TableRow key={badgePlayer.id}>
                <TableCell>{<PlayerChip player={badgePlayer.player} size="small" />}</TableCell>
                <TableCell width={1}>
                  <Stack direction="row" gap={1} flexWrap="nowrap" justifyContent="space-around">
                    <Button variant="outlined" color="error" onClick={() => onDelete(badgePlayer)}>
                      <FontAwesomeIcon icon={faXmark} size="lg" />
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {badgePlayers.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography variant="body2" color="textSecondary">
                    {t("no_players")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
