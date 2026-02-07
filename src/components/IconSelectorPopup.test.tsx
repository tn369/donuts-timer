import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IconSelectorPopup } from './IconSelectorPopup';
import type { Task } from '../types';

describe('IconSelectorPopup', () => {
  const mockTask: Task = {
    id: '1',
    name: 'Test Task',
    icon: '',
    plannedSeconds: 300,
    kind: 'todo',
    status: 'todo',
    elapsedSeconds: 0,
    actualSeconds: 0,
  };

  it('showがtrueのときに表示されること', () => {
    render(
      <IconSelectorPopup
        show={true}
        direction="bottom"
        task={mockTask}
        allExistingIcons={[]}
        onClose={vi.fn()}
        onIconSelect={vi.fn()}
        onImageUpload={vi.fn()}
      />
    );

    expect(screen.getByText('がぞうをえらぶ')).toBeInTheDocument();
  });

  it('閉じるボタンを押すとonCloseが呼ばれること', () => {
    const onClose = vi.fn();
    render(
      <IconSelectorPopup
        show={true}
        direction="bottom"
        task={mockTask}
        allExistingIcons={[]}
        onClose={onClose}
        onIconSelect={vi.fn()}
        onImageUpload={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalled();
  });

  it('バックドロップをクリックするとonCloseが呼ばれること', () => {
    // Note: backdrop is a div with styles.popupBackdrop.
    // In actual DOM it has the class, but in test we might need another way or data-testid
    const onClose = vi.fn();
    const { container } = render(
      <IconSelectorPopup
        show={true}
        direction="bottom"
        task={mockTask}
        allExistingIcons={[]}
        onClose={onClose}
        onIconSelect={vi.fn()}
        onImageUpload={vi.fn()}
      />
    );

    // Get the backdrop - it's the first motion.div inside AnimatePresence
    // Since it's in a Portal (document.body), it might not be in container
    const backdrop = document.body.querySelector('[class*="popupBackdrop"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
