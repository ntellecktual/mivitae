"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Mail, Users, Eye, Info } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const TYPE_ICONS: Record<string, typeof Bell> = {
  contact_message: Mail,
  team_invite: Users,
  profile_view_milestone: Eye,
  system: Info,
};

export default function NotificationsPage() {
  const notifications = useQuery(api.notifications.getSelf);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  async function handleMarkAll() {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  }

  async function handleMarkOne(id: Parameters<typeof markAsRead>[0]["id"]) {
    try {
      await markAsRead({ id });
    } catch {
      toast.error("Failed to mark as read");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAll}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {notifications?.map((notif) => {
          const Icon = TYPE_ICONS[notif.type] ?? Bell;
          return (
            <Card
              key={notif._id}
              className={notif.isRead ? "opacity-60" : "border-primary/20"}
            >
              <CardContent className="flex items-start gap-3 py-3 px-4">
                <div className="mt-0.5 shrink-0">
                  <Icon className={`h-4 w-4 ${notif.isRead ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  {notif.link && (
                    <Link href={notif.link} className="inline-flex items-center rounded-lg px-2.5 py-1 text-sm font-medium hover:bg-muted">View</Link>
                  )}
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkOne(notif._id)}
                    >
                      Read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
