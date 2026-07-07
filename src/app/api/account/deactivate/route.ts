import {NextResponse} from "next/server";
import {clearSessionCookie, getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {deleteObject} from "@/lib/storage";

function uniqueKeys(keys: Array<string | null | undefined>) {
  return [...new Set(keys.filter((key): key is string => Boolean(key)))];
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});

  const ownedTeams = await prisma.team.findMany({
    where: {ownerId: user.id},
    select: {id: true}
  });
  const ownedTeamIds = ownedTeams.map((team) => team.id);

  const [ownedTasks, createdShareLinks] = await Promise.all([
    prisma.mediaTask.findMany({
      where: {
        OR: [
          {userId: user.id},
          ...(ownedTeamIds.length ? [{teamId: {in: ownedTeamIds}}] : [])
        ]
      },
      select: {
        id: true,
        objectKey: true,
        mediaAssets: {
          select: {objectKey: true}
        }
      }
    }),
    prisma.shareLink.findMany({
      where: {
        createdById: user.id,
        mediaTask: {
          userId: {not: user.id}
        }
      },
      select: {id: true}
    })
  ]);

  const ownedTaskIds = ownedTasks.map((task) => task.id);
  const createdShareLinkIds = createdShareLinks.map((shareLink) => shareLink.id);
  const objectKeys = uniqueKeys([
    ...ownedTasks.map((task) => task.objectKey),
    ...ownedTasks.flatMap((task) => task.mediaAssets.map((asset) => asset.objectKey))
  ]);

  await prisma.$transaction(async (tx) => {
    if (ownedTaskIds.length) {
      await tx.mediaTask.deleteMany({where: {id: {in: ownedTaskIds}}});
    }

    if (createdShareLinkIds.length) {
      await tx.shareLink.deleteMany({where: {id: {in: createdShareLinkIds}}});
    }

    await tx.auditLog.deleteMany({where: {userId: user.id}});
    await tx.teamMember.deleteMany({where: {userId: user.id}});
    await tx.apiKey.deleteMany({where: {createdById: user.id}});
    await tx.webhookEndpoint.deleteMany({where: {createdById: user.id}});

    if (ownedTeamIds.length) {
      await tx.mediaTask.deleteMany({where: {teamId: {in: ownedTeamIds}}});
      await tx.auditLog.deleteMany({where: {teamId: {in: ownedTeamIds}}});
      await tx.teamMember.deleteMany({where: {teamId: {in: ownedTeamIds}}});
      await tx.team.deleteMany({where: {id: {in: ownedTeamIds}}});
    }

    await tx.user.delete({where: {id: user.id}});
  });

  await Promise.allSettled(objectKeys.map((key) => deleteObject(key)));
  clearSessionCookie();
  return NextResponse.json({ok: true});
}

// 旧客户端使用 POST /user/deactivate；rewrite 转到规范接口后仍保留同一方法兼容。
export const POST = DELETE;
