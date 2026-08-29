import { useState } from 'react';
import type { User } from '@/features/event-detail/types';

/**
 * UsersInfo の行から開始する、本人によるセルフサービスの編集・削除フロー。
 *
 * 「参加者を削除する」導線はもう1つ、幹事用メニュー（MenuButton →
 * UserDeletePickerDialog）が一覧から選んで削除する形で別途存在する。
 * こちらは本人が自分のパスワードで自分の行から編集・削除する専用のフローで、
 * 両者はUXの前提（本人 or 一覧から選ぶ幹事）が異なるため意図的に分離されている。
 *
 * 編集は confirmPassword（パスワード確認） → editUser（編集本体）の2段階。
 * confirmPassword.onConfirm は RPC 側の crypt() 照合を通過した時のみ呼ばれる
 * （不一致時は呼び出し元がエラー表示してダイアログを開いたままにする）。
 * 検証済みの平文パスワードは editUser.password に渡り、編集 RPC の再検証に使われる。
 * 削除は deleteUser 単体で完結する。
 *
 * 各キーは対応するダイアログコンポーネントの props にそのまま渡せる形にしている。
 */
export function useUserDialogFlow() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const startEdit = (user: User) => {
    setEditingUser(user);
    setPasswordOpen(true);
  };

  const startDelete = (user: User) => {
    setDeletingUser(user);
    setDeleteOpen(true);
  };

  // onOpenChange はユーザーがキャンセルした時だけ呼ばれる（成功時は onConfirm 経由で editUser を開く）
  const handlePasswordOpenChange = (open: boolean) => {
    setPasswordOpen(open);
    if (!open) setEditingUser(null);
  };

  // パスワード照合成功時のみ呼ばれる。検証済みの平文を editUser.password へ引き回す
  const handlePasswordConfirm = (password: string) => {
    setConfirmedPassword(password);
    setPasswordOpen(false);
    setEditOpen(true);
  };

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) {
      setEditingUser(null);
      setConfirmedPassword('');
    }
  };

  const handleDeleteOpenChange = (open: boolean) => {
    setDeleteOpen(open);
    if (!open) setDeletingUser(null);
  };

  return {
    confirmPassword: {
      open: passwordOpen,
      user: editingUser,
      onOpenChange: handlePasswordOpenChange,
      onConfirm: handlePasswordConfirm,
    },
    editUser: {
      open: editOpen,
      user: editingUser,
      password: confirmedPassword,
      onOpenChange: handleEditOpenChange,
    },
    deleteUser: {
      open: deleteOpen,
      user: deletingUser,
      onOpenChange: handleDeleteOpenChange,
    },
    startEdit,
    startDelete,
  };
}
