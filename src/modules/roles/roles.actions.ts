export type PanelPermissions =
  | "ViewPlayers"
  | "ViewPlayerDetails"
  | "BanPlayers"
  | "ViewBanlist"
  | "FadePlayers"
  | "RefundPlayers"
  | "UnbanPlayers"
  | "WarnPlayers"
  | "ReadServerLogs"
  | "ReadPanelLogs"
  | "Announcement"
  | "CompansateCalculator"
  | "ChangePanelSettings"
  | "Administrator";

export interface IRoleActions {
  title: string;
  action: PanelPermissions;
  desc: string;
  permissionBit: number;
  id: number;
}

export const roleActions: Record<PanelPermissions, IRoleActions> = {
  ViewPlayers: {
    title: "View Players",
    action: "ViewPlayers",
    desc: "Role will be able to see player datas.",
    permissionBit: 1 << 0,
    id: 0,
  },
  ViewPlayerDetails: {
    title: "View Player Details",
    action: "ViewPlayerDetails",
    desc: "Role will be able to see player details.",
    permissionBit: 1 << 1,
    id: 1,
  },
  BanPlayers: {
    title: "Ban Players",
    action: "BanPlayers",
    desc: "Role will be able to ban players.",
    permissionBit: 1 << 2,
    id: 2,
  },
  ViewBanlist: {
    title: "View Banlist",
    action: "ViewBanlist",
    desc: "Role will be able to view banlist.",
    permissionBit: 1 << 3,
    id: 3,
  },
  FadePlayers: {
    title: "Fade Players",
    action: "FadePlayers",
    desc: "Role will be able to fade players.",
    permissionBit: 1 << 4,
    id: 4,
  },
  RefundPlayers: {
    title: "Refund Players",
    action: "RefundPlayers",
    desc: "Role will be able to refund players.",
    permissionBit: 1 << 5,
    id: 5,
  },
  UnbanPlayers: {
    title: "Unban Players",
    action: "UnbanPlayers",
    desc: "Role will be able to unban players.",
    permissionBit: 1 << 6,
    id: 6,
  },
  WarnPlayers: {
    title: "Warn Players",
    action: "WarnPlayers",
    desc: "Role will be able to warn players.",
    permissionBit: 1 << 7,
    id: 7,
  },
  ReadServerLogs: {
    title: "Read Server Logs",
    action: "ReadServerLogs",
    desc: "Role will be able to read server logs.",
    permissionBit: 1 << 8,
    id: 8,
  },
  ReadPanelLogs: {
    title: "Read Panel Logs",
    action: "ReadPanelLogs",
    desc: "Role will be able to read panel logs.",
    permissionBit: 1 << 9,
    id: 9,
  },
  Announcement: {
    title: "Announcement",
    action: "Announcement",
    desc: "Role will be able make announcement in-game.",
    permissionBit: 1 << 10,
    id: 10,
  },
  CompansateCalculator: {
    title: "Compansate Calculator",
    action: "CompansateCalculator",
    desc: "Role will be able use compansate calculator from panel.",
    permissionBit: 1 << 11,
    id: 11,
  },
  ChangePanelSettings: {
    title: "Configure Panel Settings",
    action: "ChangePanelSettings",
    desc: "Role will be able to change configuration related to panel.",
    permissionBit: 1 << 12,
    id: 12,
  },
  Administrator: {
    title: "Administrator",
    action: "Administrator",
    desc: "Full access to all features.",
    permissionBit: 1 << 13,
    id: 13,
  },
};
