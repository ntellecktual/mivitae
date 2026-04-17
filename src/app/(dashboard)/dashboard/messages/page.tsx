"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function MessagesPage() {
  const messages = useQuery(api.contactMessages.getSelfMessages);
  const markAsRead = useMutation(api.contactMessages.markAsRead);

  async function handleMarkRead(id: Parameters<typeof markAsRead>[0]["id"]) {
    try {
      await markAsRead({ id });
    } catch {
      toast.error("Failed to mark as read");
    }
  }

  const unreadCount = messages?.filter((m) => !m.isRead).length ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Messages from visitors who used the contact form on your portfolio.
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">{unreadCount} unread</Badge>
          )}
        </p>
      </div>

      {messages?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No messages yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              When visitors contact you through your portfolio, their messages will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {messages?.map((msg) => (
          <Card
            key={msg._id}
            className={msg.isRead ? "opacity-70" : "border-primary/30 shadow-sm"}
          >
            <CardContent className="py-4 px-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {msg.isRead ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className="font-semibold truncate">{msg.senderName}</span>
                    <a
                      href={`mailto:${msg.senderEmail}`}
                      className="text-sm text-muted-foreground hover:text-foreground truncate flex items-center gap-1"
                    >
                      {msg.senderEmail}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col gap-1">
                  {!msg.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkRead(msg._id)}
                    >
                      Mark Read
                    </Button>
                  )}
                  <a href={`mailto:${msg.senderEmail}`} className="inline-flex items-center rounded-lg border border-border bg-background px-2.5 py-1 text-sm font-medium hover:bg-muted">Reply</a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
