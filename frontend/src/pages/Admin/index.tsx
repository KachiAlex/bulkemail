import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import { Edit, Delete, Refresh, Add } from '@mui/icons-material';
import { usersAPI } from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { isAdmin } from '../../utils/rbac';
import { toast } from 'react-toastify';

interface UserRow {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
}

export default function AdminPage() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [form, setForm] = useState<{ firstName?: string; lastName?: string; role?: string }>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ email: string; password?: string; firstName?: string; lastName?: string; role?: string }>({ email: '', role: 'user' });

  const canManage = useMemo(() => isAdmin(currentUser), [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data as any);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (u: UserRow) => {
    setSelected(u);
    setForm({ firstName: u.firstName || '', lastName: u.lastName || '', role: u.role || 'user' });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    try {
      await usersAPI.update(selected.id, form);
      toast.success('User updated');
      setEditOpen(false);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update user');
    }
  };

  const deleteUser = async (u: UserRow) => {
    if (!window.confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    try {
      await usersAPI.delete(u.id);
      toast.success('User deleted');
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete user');
    }
  };

  const createUser = async () => {
    if (!createForm.email) {
      toast.error('Email is required');
      return;
    }
    try {
      await usersAPI.create(createForm);
      toast.success('User created');
      setCreateOpen(false);
      setCreateForm({ email: '', role: 'user' });
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create user');
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Admin</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} sx={{ mr: 1 }} onClick={() => setCreateOpen(true)} disabled={!canManage}>
            New User
          </Button>
          <Button onClick={fetchUsers} startIcon={<Refresh />} disabled={loading}>
            Refresh
          </Button>
        </Box>
      </Stack>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip size="small" label={u.role || 'user'} color={u.role === 'admin' ? 'primary' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton disabled={!canManage} onClick={() => openEdit(u)}>
                        <Edit />
                      </IconButton>
                      <IconButton disabled={!canManage || currentUser?.id === u.id} onClick={() => deleteUser(u)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box mt={1} display="grid" gap={2}>
            <TextField label="First Name" value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <TextField label="Last Name" value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <TextField label="Role" value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} helperText="Use 'admin' to grant admin access" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New User</DialogTitle>
        <DialogContent>
          <Box mt={1} display="grid" gap={2}>
            <TextField label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
            <TextField label="Password" type="password" value={createForm.password || ''} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
            <TextField label="First Name" value={createForm.firstName || ''} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} />
            <TextField label="Last Name" value={createForm.lastName || ''} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} />
            <TextField label="Role" value={createForm.role || ''} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} helperText="Use 'admin' to grant admin access" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createUser} disabled={!canManage}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


