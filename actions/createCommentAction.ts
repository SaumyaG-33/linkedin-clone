"use server";

import { currentUser } from "@clerk/nextjs/server";
import { AddCommentRequestBody } from "app/api/posts/[post_id]/comments/route";
import { revalidate } from "app/page";
import { ICommentBase } from "mongodb/models/comment";
import { Post } from "mongodb/models/post";
import { revalidatePath } from "next/cache";
import { Icon } from "next/dist/lib/metadata/types/metadata-types";
import { IUser } from "types/user";

export default async function createCommentAction(
    postId: string,
    formData: FormData
) {
    const user = await currentUser();
    const commentInput = formData.get("commentInput") as string;

    
    if(!user?.id) {
        throw new Error("You must be signed in to comment");
    }

    if(!postId) {
        throw new Error("Post ID is required to create a comment");
    }
    if(!commentInput) {
        throw new Error("Comment cannot be empty");
    }   

    const userDB: IUser = {
       userId: user.id,
       userImage: user.imageUrl,
       firstName: user.firstName || "",
        lastName: user.lastName || "", 
       
    };
    const body: AddCommentRequestBody = {
        user: userDB,
        text: commentInput,
    };

    const post = await Post.findById(postId);

    if(!post) {
        throw new Error("Post not found");
    }

    const comment: ICommentBase = {
        user: userDB,
        text: commentInput,
    };

    try {
        await post.commentOnPost(comment);
        revalidatePath("/");
    } catch(error) {
        throw new Error("Error creating comment");
    }
}

