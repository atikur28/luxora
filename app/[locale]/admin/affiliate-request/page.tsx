import { auth } from "@/auth";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import AcceptDialog from "@/components/shared/pending-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  acceptAffiliateRequest,
  deleteUser,
  getAllUsers,
} from "@/lib/actions/user.actions";
import { IUser } from "@/lib/db/models/user.model";
import { formatId } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Requests",
};

export default async function AffiliateRequestPage(props: {
  searchParams: Promise<{ page: string }>;
}) {
  const params = await props.searchParams;
  const session = await auth();
  if (session?.user.role !== "Admin")
    throw new Error("Admin permission required");

  const page = Number(params.page) || 1;

  const users = await getAllUsers({
    page,
    limit: 20,
  });

  return (
    <div className="space-y-2">
      <h1 className="h1-bold">Pending Affiliate Requests</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {[
            ...users?.data.filter(
              (user: IUser) =>
                user.affiliateRequest && user.role !== "Affiliater"
            ),
            ...users?.data.filter((user: IUser) => user.role === "Affiliater"),
          ].map((user: IUser) => (
            <TableRow key={user._id}>
              <TableCell>{formatId(user._id)}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell className="flex gap-1">
                {user.role === "Affiliater" ? (
                  <Button variant="outline" size="sm" disabled>
                    Accepted
                  </Button>
                ) : (
                  <AcceptDialog
                    userId={user._id}
                    action={acceptAffiliateRequest}
                  />
                )}
                <DeleteDialog id={user._id} action={deleteUser} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users?.totalPages > 1 && (
        <Pagination page={page} totalPages={users?.totalPages} />
      )}
    </div>
  );
}
