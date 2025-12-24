import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FiPlus, FiSearch, FiMusic, FiList, FiCheck } from 'react-icons/fi';
import { Button, Input, Modal } from 'adnaan-ui';
import { API } from '@/utils/api';

interface AddMusicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ModalContent = styled.div`
  width: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.1);
  padding-bottom: 0.5rem;
`;

const Tab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--accent-color);
    transform: scaleX(${(props) => (props.active ? 1 : 0)});
    transition: transform 0.2s;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const PlatformCard = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid ${(props) => (props.active ? 'var(--accent-color)' : 'rgba(var(--border-rgb), 0.1)')};
  background: ${(props) => (props.active ? 'rgba(var(--accent-rgb), 0.05)' : 'rgba(var(--bg-secondary-rgb), 0.4)')};
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-primary)')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-color);
  }
`;

const PreviewCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(var(--bg-secondary-rgb), 0.6);
  border: 1px solid rgba(var(--border-rgb), 0.1);
`;

const PreviewCover = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
`;

const PreviewInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PreviewTitle = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PreviewArtist = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--accent-rgb), 0.2);
    border-radius: 2px;
  }
`;

const PlaylistItem = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: ${(props) => (props.selected ? 'rgba(var(--accent-rgb), 0.05)' : 'transparent')};
  border: 1px solid ${(props) => (props.selected ? 'var(--accent-color)' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(var(--bg-secondary-rgb), 0.8);
  }
`;

const Checkbox = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid ${(props) => (props.checked ? 'var(--accent-color)' : 'rgba(var(--border-rgb), 0.2)')};
  background: ${(props) => (props.checked ? 'var(--accent-color)' : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  transition: all 0.2s;
`;

export const AddMusicModal: React.FC<AddMusicModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<'single' | 'playlist'>('single');
    const [server, setServer] = useState<'netease' | 'tencent'>('netease');
    const [songId, setSongId] = useState('');
    const [playlistId, setPlaylistId] = useState('');

    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewSong, setPreviewSong] = useState<any>(null);
    const [previewPlaylist, setPreviewPlaylist] = useState<any[]>([]);
    const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePreviewSong = async () => {
        if (!songId.trim()) return;
        setIsPreviewLoading(true);
        setPreviewSong(null);
        try {
            const response = await API.userMusic.previewMusic({ server, songId });
            if (response.success) {
                setPreviewSong(response.data);
            }
        } catch (error) {
            console.error('预览歌曲失败:', error);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handlePreviewPlaylist = async () => {
        if (!playlistId.trim()) return;
        setIsPreviewLoading(true);
        setPreviewPlaylist([]);
        setSelectedSongIds([]);
        try {
            const response = await API.userMusic.previewPlaylist({ server, playlistId });
            if (response.success) {
                setPreviewPlaylist(response.data || []);
                setSelectedSongIds((response.data || []).map((s: any) => s.songId));
            }
        } catch (error) {
            console.error('预览歌单失败:', error);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const toggleSongSelection = (id: string) => {
        setSelectedSongIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAddSingle = async () => {
        if (!previewSong) return;
        setIsSubmitting(true);
        try {
            const response = await API.userMusic.addMusic({ server, songId });
            if (response.success) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('添加歌曲失败:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImportPlaylist = async () => {
        if (selectedSongIds.length === 0) return;
        setIsSubmitting(true);
        try {
            const response = await API.userMusic.importPlaylist({
                server,
                playlistId,
                songIds: selectedSongIds
            });
            if (response.success) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('导入歌单失败:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>取消</Button>
            {activeTab === 'single' ? (
                <Button
                    variant="primary"
                    onClick={handleAddSingle}
                    disabled={!previewSong || isSubmitting}
                    isLoading={isSubmitting}
                    leftIcon={<FiPlus />}
                >
                    确认添加
                </Button>
            ) : (
                <Button
                    variant="primary"
                    onClick={handleImportPlaylist}
                    disabled={selectedSongIds.length === 0 || isSubmitting}
                    isLoading={isSubmitting}
                    leftIcon={<FiPlus />}
                >
                    导入所选 ({selectedSongIds.length})
                </Button>
            )}
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="添加音乐" size="medium" footer={footer}>
            <ModalContent>
                <TabContainer>
                    <Tab active={activeTab === 'single'} onClick={() => setActiveTab('single')}>
                        <FiMusic /> 添加单曲
                    </Tab>
                    <Tab active={activeTab === 'playlist'} onClick={() => setActiveTab('playlist')}>
                        <FiList /> 导入歌单
                    </Tab>
                </TabContainer>

                <FormSection>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>选择平台</div>
                    <PlatformGrid>
                        <PlatformCard active={server === 'netease'} onClick={() => setServer('netease')}>
                            网易云音乐
                        </PlatformCard>
                        <PlatformCard active={server === 'tencent'} onClick={() => setServer('tencent')}>
                            QQ 音乐
                        </PlatformCard>
                    </PlatformGrid>
                </FormSection>

                {activeTab === 'single' ? (
                    <FormSection>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Input
                                placeholder="输入歌曲 ID"
                                value={songId}
                                onChange={(e) => setSongId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePreviewSong()}
                            />
                            <Button
                                variant="secondary"
                                onClick={handlePreviewSong}
                                isLoading={isPreviewLoading}
                                leftIcon={<FiSearch />}
                            >
                                预览
                            </Button>
                        </div>
                        {previewSong && (
                            <PreviewCard>
                                <PreviewCover src={previewSong.pic} />
                                <PreviewInfo>
                                    <PreviewTitle>{previewSong.title}</PreviewTitle>
                                    <PreviewArtist>{previewSong.artist}</PreviewArtist>
                                </PreviewInfo>
                                <FiCheck color="#10b981" size={24} />
                            </PreviewCard>
                        )}
                    </FormSection>
                ) : (
                    <FormSection>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Input
                                placeholder="输入歌单 ID"
                                value={playlistId}
                                onChange={(e) => setPlaylistId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePreviewPlaylist()}
                            />
                            <Button
                                variant="secondary"
                                onClick={handlePreviewPlaylist}
                                isLoading={isPreviewLoading}
                                leftIcon={<FiSearch />}
                            >
                                解析
                            </Button>
                        </div>
                        {previewPlaylist.length > 0 && (
                            <PlaylistContainer>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>共 {previewPlaylist.length} 首歌曲</span>
                                    <Button
                                        variant="ghost"
                                        size="small"
                                        onClick={() => setSelectedSongIds(
                                            selectedSongIds.length === previewPlaylist.length ? [] : previewPlaylist.map(s => s.songId)
                                        )}
                                    >
                                        {selectedSongIds.length === previewPlaylist.length ? '取消全选' : '全选'}
                                    </Button>
                                </div>
                                {previewPlaylist.map((song) => (
                                    <PlaylistItem
                                        key={song.songId}
                                        selected={selectedSongIds.includes(song.songId)}
                                        onClick={() => toggleSongSelection(song.songId)}
                                    >
                                        <Checkbox checked={selectedSongIds.includes(song.songId)}>
                                            {selectedSongIds.includes(song.songId) && <FiCheck />}
                                        </Checkbox>
                                        <PreviewCover src={song.pic} style={{ width: 40, height: 40 }} />
                                        <PreviewInfo>
                                            <PreviewTitle style={{ fontSize: '0.85rem' }}>{song.title}</PreviewTitle>
                                            <PreviewArtist style={{ fontSize: '0.75rem' }}>{song.artist}</PreviewArtist>
                                        </PreviewInfo>
                                    </PlaylistItem>
                                ))}
                            </PlaylistContainer>
                        )}
                    </FormSection>
                )}
            </ModalContent>
        </Modal>
    );
};
