import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { useState } from "react";
import { AttachmentSection } from "../../src/components/AttachmentSection.js";
import { RequesterContext } from "../../src/context/RequesterContext.js";
import * as api from "../../src/api.js";

// Mock the API module
vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    fetchTicketAttachments: vi.fn(),
    uploadTicketAttachment: vi.fn(),
    downloadAttachment: vi.fn(),
    softRemoveAttachment: vi.fn(),
  };
});

const mockRequester = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@toktickit.dev",
  department: "Engineering",
  isActive: true,
};

const mockRequester2 = {
  id: 2,
  name: "Michael Brown",
  email: "michael.b@toktickit.dev",
  department: "IT Support",
  isActive: true,
};

const mockActiveAttachment: api.AttachmentMetadata = {
  id: 10,
  ticketId: 101,
  originalName: "system_report.pdf",
  mimeType: "application/pdf",
  sizeBytes: 1048576,
  isRemoved: false,
  createdAt: "2026-09-01T10:00:00.000Z",
};

const mockSoftRemovedAttachment: api.AttachmentMetadata = {
  id: 11,
  ticketId: 101,
  originalName: "old_screenshot.png",
  mimeType: "image/png",
  sizeBytes: 512000,
  isRemoved: true,
  removalReason: "Uploaded wrong version",
  removedAt: "2026-09-01T10:30:00.000Z",
  createdAt: "2026-09-01T09:00:00.000Z",
};

function renderComponent(props: { ticketId: number; selectedReq?: any }) {
  const selectedRequester = props.selectedReq !== undefined ? props.selectedReq : mockRequester;

  return render(
    <RequesterContext.Provider
      value={{
        selectedRequester,
        requesters: [mockRequester],
        isLoading: false,
        error: null,
        isModalOpen: false,
        selectRequester: vi.fn(),
        openSelectorModal: vi.fn(),
        closeSelectorModal: vi.fn(),
        refreshRequesters: vi.fn(),
      }}
    >
      <AttachmentSection ticketId={props.ticketId} />
    </RequesterContext.Provider>
  );
}

describe("AttachmentSection Component (Issue 13)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active and soft-removed attachments correctly", async () => {
    (api.fetchTicketAttachments as any).mockResolvedValue([mockActiveAttachment, mockSoftRemovedAttachment]);

    renderComponent({ ticketId: 101 });

    expect(screen.getByTestId("attachments-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("active-attachment-count")).toHaveTextContent("Active Attachments: 1 / 5");
    });

    expect(screen.getByTestId("active-attachment-row-10")).toBeInTheDocument();
    expect(screen.getByText("system_report.pdf")).toBeInTheDocument();
    expect(screen.getByText("1 MB")).toBeInTheDocument();

    expect(screen.getByTestId("removed-attachment-row-11")).toBeInTheDocument();
    expect(screen.getByText("old_screenshot.png")).toBeInTheDocument();
    expect(screen.getByText("Uploaded wrong version")).toBeInTheDocument();
    expect(screen.getByTestId("removed-badge-11")).toBeInTheDocument();
  });

  it("validates client-side file type and rejects unsupported extension (.exe)", async () => {
    (api.fetchTicketAttachments as any).mockResolvedValue([]);
    renderComponent({ ticketId: 101 });

    await waitFor(() => {
      expect(screen.getByTestId("attachment-upload-form")).toBeInTheDocument();
    });

    const fileInput = screen.getByTestId("file-input");
    const invalidFile = new File(["dummy binary"], "malicious.exe", { type: "application/x-msdownload" });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(screen.getByTestId("upload-error-banner")).toHaveTextContent("File type not supported");
    expect(screen.getByTestId("upload-submit-btn")).toBeDisabled();
  });

  it("validates client-side file size and rejects files exceeding 5MB", async () => {
    (api.fetchTicketAttachments as any).mockResolvedValue([]);
    renderComponent({ ticketId: 101 });

    await waitFor(() => {
      expect(screen.getByTestId("attachment-upload-form")).toBeInTheDocument();
    });

    const fileInput = screen.getByTestId("file-input");
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "too_large.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(screen.getByTestId("upload-error-banner")).toHaveTextContent("exceeds maximum allowed limit of 5 MB");
    expect(screen.getByTestId("upload-submit-btn")).toBeDisabled();
  });

  it("disables upload form and displays alert banner when active attachment count reaches 5", async () => {
    const fiveActiveAttachments: api.AttachmentMetadata[] = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      ticketId: 101,
      originalName: `file_${i + 1}.pdf`,
      mimeType: "application/pdf",
      sizeBytes: 1024,
      isRemoved: false,
      createdAt: "2026-09-01T10:00:00.000Z",
    }));

    (api.fetchTicketAttachments as any).mockResolvedValue(fiveActiveAttachments);

    renderComponent({ ticketId: 101 });

    await waitFor(() => {
      expect(screen.getByTestId("attachment-limit-alert")).toBeInTheDocument();
    });

    expect(screen.getByTestId("active-attachment-count")).toHaveTextContent("Active Attachments: 5 / 5");
    expect(screen.queryByTestId("attachment-upload-form")).not.toBeInTheDocument();
  });

  it("triggers download Attachment API upon clicking Download button", async () => {
    (api.fetchTicketAttachments as any).mockResolvedValue([mockActiveAttachment]);
    (api.downloadAttachment as any).mockResolvedValue(undefined);

    renderComponent({ ticketId: 101 });

    await waitFor(() => {
      expect(screen.getByTestId("download-btn-10")).toBeInTheDocument();
    });

    const downloadBtn = screen.getByTestId("download-btn-10");
    fireEvent.click(downloadBtn);

    expect(api.downloadAttachment).toHaveBeenCalledWith(10, 1);
  });

  it("opens soft-removal modal, enforces mandatory reason min length, and soft-removes file", async () => {
    (api.fetchTicketAttachments as any).mockResolvedValue([mockActiveAttachment]);
    (api.softRemoveAttachment as any).mockResolvedValue({
      ...mockActiveAttachment,
      isRemoved: true,
      removalReason: "Obsolete file version",
    });

    renderComponent({ ticketId: 101 });

    await waitFor(() => {
      expect(screen.getByTestId("soft-remove-btn-10")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("soft-remove-btn-10"));

    expect(screen.getByTestId("soft-remove-modal")).toBeInTheDocument();
    const confirmBtn = screen.getByTestId("confirm-soft-remove-btn");
    expect(confirmBtn).toBeDisabled();

    const reasonInput = screen.getByTestId("removal-reason-input");
    fireEvent.change(reasonInput, { target: { value: "Obsolete file version" } });
    expect(confirmBtn).not.toBeDisabled();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.softRemoveAttachment).toHaveBeenCalledWith(10, 1, "Obsolete file version");
    });
  });

  it("ignores stale upload completion if requester changes while upload is pending", async () => {
    let resolveUpload: (value: any) => void;
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve;
    });

    (api.fetchTicketAttachments as any).mockImplementation((_tId: number, reqId: number) => {
      if (reqId === 1) return Promise.resolve([mockActiveAttachment]);
      return Promise.resolve([]);
    });

    (api.uploadTicketAttachment as any).mockReturnValue(uploadPromise);

    function DynamicComponent() {
      const [selectedRequester, setSelectedRequester] = useState<any>(mockRequester);

      return (
        <RequesterContext.Provider
          value={{
            selectedRequester,
            requesters: [mockRequester, mockRequester2],
            isLoading: false,
            error: null,
            isModalOpen: false,
            selectRequester: (r) => setSelectedRequester(r),
            openSelectorModal: vi.fn(),
            closeSelectorModal: vi.fn(),
            refreshRequesters: vi.fn(),
          }}
        >
          <button
            data-testid="switch-to-req2-btn"
            onClick={() => setSelectedRequester(mockRequester2)}
          >
            Switch Requester
          </button>
          <AttachmentSection ticketId={101} />
        </RequesterContext.Provider>
      );
    }

    render(<DynamicComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("active-attachment-count")).toHaveTextContent("Active Attachments: 1 / 5");
    });

    const fileInput = screen.getByTestId("file-input");
    const validFile = new File(["dummy content"], "new_doc.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const uploadBtn = screen.getByTestId("upload-submit-btn");
    fireEvent.click(uploadBtn);

    // Switch requester context while upload is pending
    fireEvent.click(screen.getByTestId("switch-to-req2-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("active-attachment-count")).toHaveTextContent("Active Attachments: 0 / 5");
    });

    // Now resolve stale upload for Requester 1
    await act(async () => {
      resolveUpload!({
        id: 99,
        ticketId: 101,
        originalName: "new_doc.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        isRemoved: false,
        createdAt: "2026-09-01T12:00:00.000Z",
      });
    });

    // Verify state remains Requester 2 (0 active attachments) and busy state was reset
    expect(screen.getByTestId("active-attachment-count")).toHaveTextContent("Active Attachments: 0 / 5");
    expect(screen.queryByText("new_doc.pdf")).not.toBeInTheDocument();

    // Verify upload form for Requester 2 is functional and not stuck in busy state
    const newFileInput = screen.getByTestId("file-input");
    const req2File = new File(["req2 file content"], "req2_doc.pdf", { type: "application/pdf" });
    fireEvent.change(newFileInput, { target: { files: [req2File] } });
    expect(screen.getByTestId("upload-submit-btn")).not.toBeDisabled();
  });
});
